import tensorflow as tf
import numpy as np
import cv2
import logging

logger = logging.getLogger(__name__)

def generate_gradcam(model, 
                     img_array, 
                     pred_index=None, 
                     target_layer_name=None):
    """
    Generate Grad-CAM visualization for ResNet50-based models.
    """
    logger.info("Starting GradCAM generation...")

    # Ensure batch dimension and proper type
    if len(img_array.shape) == 3:
        img_array = np.expand_dims(img_array, axis=0)
    
    # Ensure float32 type
    img_array = img_array.astype('float32')

    # If no target layer specified, use the last conv layer
    if not target_layer_name:
        target_layer_name = 'conv5_block3_out'
        logger.info(f"Using default layer: {target_layer_name}")

    try:
        # Get the ResNet50 base model
        resnet_model = model.get_layer('resnet50')
        # Get the target layer from within ResNet50
        target_layer = resnet_model.get_layer(target_layer_name)
        logger.info(f"Using layer: {target_layer.name}")

        # Create a model that maps the input to the target layer output
        grad_model = tf.keras.models.Model(
            inputs=[resnet_model.input],
            outputs=[target_layer.output, resnet_model.output]
        )

        # Convert input to tensor
        img_tensor = tf.convert_to_tensor(img_array)
        
        # Create a dictionary with the named input
        input_dict = {resnet_model.input.name: img_tensor}

        # Compute gradients using GradientTape
        with tf.GradientTape() as tape:
            tape.watch(img_tensor)
            conv_outputs, predictions = grad_model(input_dict, training=False)
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            class_score = predictions[:, pred_index]

        # Calculate gradients
        grads = tape.gradient(class_score, conv_outputs)
        
        # Global average pooling
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # Weight the channels by the computed gradients
        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_sum(tf.multiply(pooled_grads, conv_outputs), axis=-1)

        # ReLU and normalization
        heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + tf.keras.backend.epsilon())
        heatmap = heatmap.numpy()

        # Resize heatmap to match input image size
        height, width = img_array.shape[1:3]
        heatmap = cv2.resize(heatmap, (width, height))
        heatmap = cv2.GaussianBlur(heatmap, (3, 3), 0)

        # Normalize heatmap
        heatmap = np.maximum(heatmap, 0)
        if np.max(heatmap) > 0:
            heatmap = heatmap / np.max(heatmap)

        # Convert heatmap to RGB
        heatmap_colored = np.uint8(255 * heatmap)
        heatmap_colored = cv2.applyColorMap(heatmap_colored, cv2.COLORMAP_JET)

        # Get original image and ensure proper type
        original_img = deprocess_image(img_array[0].copy())
        
        # Ensure both images have the same shape
        if original_img.shape != heatmap_colored.shape:
            heatmap_colored = cv2.resize(heatmap_colored, (original_img.shape[1], original_img.shape[0]))
        
        # Convert both images to float64 for the weighted addition
        original_img = original_img.astype('float64')
        heatmap_colored = heatmap_colored.astype('float64')
        
        # Superimpose heatmap on original image
        alpha = 0.4
        superimposed = cv2.addWeighted(
            original_img, 
            1.0, 
            heatmap_colored,
            alpha, 
            0.0
        )
        
        # Convert all images back to uint8
        superimposed = np.clip(superimposed, 0, 255).astype('uint8')
        original_img = original_img.astype('uint8')
        heatmap_colored = heatmap_colored.astype('uint8')

        logger.info("GradCAM generation completed successfully")
        return original_img, heatmap_colored, superimposed

    except Exception as e:
        logger.error(f"Error in GradCAM generation: {str(e)}")
        logger.error(f"Full error: {e.__class__.__name__}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise

def encode_image(img_array):
    """Convert numpy array to base64 encoded string"""
    import base64
    import cv2
    _, buffer = cv2.imencode('.png', img_array)
    return base64.b64encode(buffer).decode('utf-8')

def preprocess_image(image_bytes):
    """Preprocess the uploaded image for ResNet50 model prediction."""
    # Convert bytes to OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Resize to match model input size
    img = cv2.resize(img, (224, 224))
    
    # Convert BGR to RGB (OpenCV loads in BGR, ResNet expects RGB)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Convert to float32 and expand dimensions
    img_array = np.expand_dims(img.astype(np.float32), axis=0)
    
    # Apply ResNet50 preprocessing
    from tensorflow.keras.applications.resnet50 import preprocess_input
    img_array = preprocess_input(img_array)
    
    return img_array

def deprocess_image(img_array):
    """Reverse ResNet50 preprocessing for visualization."""
    img = img_array.copy()
    
    # Convert to float64 for calculations
    img = img.astype('float64')
    
    # Add the ImageNet mean RGB values
    img[..., 0] += 103.939  # Blue
    img[..., 1] += 116.779  # Green
    img[..., 2] += 123.68   # Red
    
    # Convert BGR to RGB
    img = img[..., ::-1]
    
    # Clip values to [0, 255]
    img = np.clip(img, 0, 255)
    
    # Convert to uint8
    return img.astype('uint8')
