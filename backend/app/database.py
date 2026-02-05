from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text, Date, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

SQLALCHEMY_DATABASE_URL = "sqlite:///./neuroview.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# database models
class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    last_visit = Column(String)
    date_of_birth = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    insurance = Column(String)
    policy_number = Column(String)
    emergency_contact = Column(String)
    status = Column(String)
    condition = Column(String)
    
    # relationship with studies
    studies = relationship("Study", back_populates="patient", cascade="all, delete-orphan")
    
    # JSON columns (stored as TEXT for SQLite)
    medical_history = Column(Text)  
    medications = Column(Text)     
    allergies = Column(Text)        

class Study(Base):
    __tablename__ = "studies"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id"))
    date = Column(String)
    type = Column(String)
    status = Column(String)
    findings = Column(Text)
    thumbnail_url = Column(String)
    analysis_data = Column(Text)  # store the analysis results as JSON
    
    # relationship with patient
    patient = relationship("Patient", back_populates="studies")

# create all tables
Base.metadata.create_all(bind=engine) 