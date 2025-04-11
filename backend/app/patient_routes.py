import json
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from .database import SessionLocal, Patient, Study

router = APIRouter(prefix="/patients", tags=["patients"])

# Models for request/response
class StudyBase(BaseModel):
    type: str
    date: str
    status: str
    findings: str
    thumbnail_url: str

class StudyCreate(StudyBase):
    pass

class StudyResponse(StudyBase):
    id: str
    analysis_data: Optional[Dict[str, Any]] = None

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    last_visit: str
    date_of_birth: str
    phone: str
    email: str
    address: str
    insurance: str
    policy_number: str
    emergency_contact: str
    status: str
    condition: str
    medical_history: List[str]
    medications: List[str]
    allergies: List[str]

class PatientCreate(PatientBase):
    pass

class PatientResponse(PatientBase):
    id: str
    studies: List[StudyResponse]

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes
@router.get("", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()

    # Convert patients to response format
    result = []
    for patient in patients:
        # Create a patient dict
        patient_dict = {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "last_visit": patient.last_visit,
            "date_of_birth": patient.date_of_birth,
            "phone": patient.phone,
            "email": patient.email,
            "address": patient.address,
            "insurance": patient.insurance,
            "policy_number": patient.policy_number,
            "emergency_contact": patient.emergency_contact,
            "status": patient.status,
            "condition": patient.condition,
            "medical_history": json.loads(patient.medical_history),
            "medications": json.loads(patient.medications),
            "allergies": json.loads(patient.allergies),
            "studies": []
        }

        # Safely handle studies without directly accessing patient.studies
        try:
            studies = db.query(Study).filter(Study.patient_id == patient.id).all()
            patient_dict["studies"] = []
            for study in studies:
                study_dict = {
                    "id": study.id,
                    "date": study.date,
                    "type": study.type,
                    "status": study.status,
                    "findings": study.findings,
                    "thumbnail_url": study.thumbnail_url,
                    "analysis_data": json.loads(study.analysis_data) if study.analysis_data else None
                }
                patient_dict["studies"].append(study_dict)
        except Exception as e:
            print(f"Error fetching studies for patient {patient.id}: {e}")
            patient_dict["studies"] = []

        result.append(patient_dict)

    return result

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Convert to response format
    patient_data = {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "last_visit": patient.last_visit,
        "date_of_birth": patient.date_of_birth,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "insurance": patient.insurance,
        "policy_number": patient.policy_number,
        "emergency_contact": patient.emergency_contact,
        "status": patient.status,
        "condition": patient.condition,
        "medical_history": json.loads(patient.medical_history),
        "medications": json.loads(patient.medications),
        "allergies": json.loads(patient.allergies),
        "studies": []
    }

    # Explicitly query for studies to ensure we get all data
    studies = db.query(Study).filter(Study.patient_id == patient.id).all()
    for study in studies:
        patient_data["studies"].append({
            "id": study.id,
            "date": study.date,
            "type": study.type,
            "status": study.status,
            "findings": study.findings,
            "thumbnail_url": study.thumbnail_url,
            "analysis_data": json.loads(study.analysis_data) if study.analysis_data else None
        })

    return patient_data

@router.post("", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    # Generate a unique ID
    import uuid
    patient_id = f"patient-{uuid.uuid4()}"

    # Create new patient object
    db_patient = Patient(
        id=patient_id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        last_visit=patient.last_visit,
        date_of_birth=patient.date_of_birth,
        phone=patient.phone,
        email=patient.email,
        address=patient.address,
        insurance=patient.insurance,
        policy_number=patient.policy_number,
        emergency_contact=patient.emergency_contact,
        status=patient.status,
        condition=patient.condition,
        medical_history=json.dumps(patient.medical_history),
        medications=json.dumps(patient.medications),
        allergies=json.dumps(patient.allergies)
    )

    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)

    # Return the created patient
    return get_patient(patient_id, db)

@router.post("/{patient_id}/studies", response_model=StudyResponse)
def add_study(patient_id: str, study: StudyCreate, db: Session = Depends(get_db)):
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Generate a unique ID for the study
    import uuid
    study_id = f"study-{uuid.uuid4()}"

    # Create new study
    db_study = Study(
        id=study_id,
        patient_id=patient_id,
        date=study.date,
        type=study.type,
        status=study.status,
        findings=study.findings,
        thumbnail_url=study.thumbnail_url,
        analysis_data=None  # Initialize with None
    )

    db.add(db_study)
    db.commit()
    db.refresh(db_study)

    return {
        "id": db_study.id,
        "date": db_study.date,
        "type": db_study.type,
        "status": db_study.status,
        "findings": db_study.findings,
        "thumbnail_url": db_study.thumbnail_url,
        "analysis_data": None  # Include in response
    }

@router.delete("/{patient_id}/studies/{study_id}")
def delete_study(patient_id: str, study_id: str, db: Session = Depends(get_db)):
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Find and delete the study
    study = db.query(Study).filter(Study.id == study_id, Study.patient_id == patient_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    db.delete(study)
    db.commit()

    return {"message": "Study deleted successfully"}

@router.delete("/{patient_id}")
def delete_patient(patient_id: str, db: Session = Depends(get_db)):
    # Find patient
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Delete patient (studies will be automatically deleted due to cascade)
    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}

@router.put("/{patient_id}/studies/{study_id}/analysis", response_model=dict)
def update_study_analysis(
    patient_id: str,
    study_id: str,
    analysis_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Find the study
    study = db.query(Study).filter(Study.id == study_id, Study.patient_id == patient_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    # Log the analysis data being saved
    print(f"Saving analysis data for study {study_id}: {analysis_data}")

    # Update the study with analysis data
    study.analysis_data = json.dumps(analysis_data)

    # Update status to completed regardless of current status
    study.status = "completed"

    db.commit()
    db.refresh(study)

    return {
        "id": study.id,
        "message": "Analysis data updated successfully",
        "status": study.status
    }

@router.get("/{patient_id}/studies/{study_id}", response_model=dict)
def get_study(
    patient_id: str,
    study_id: str,
    db: Session = Depends(get_db)
):
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Find the study
    study = db.query(Study).filter(Study.id == study_id, Study.patient_id == patient_id).first()
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")

    # Return the study data, including analysis data if available
    return {
        "id": study.id,
        "patient_id": study.patient_id,
        "date": study.date,
        "type": study.type,
        "status": study.status,
        "findings": study.findings,
        "thumbnail_url": study.thumbnail_url,
        "analysis_data": json.loads(study.analysis_data) if study.analysis_data else None
    }