import datetime
import random
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MaintenanceTask, Machine
from app.schemas import MaintenanceTaskCreate, MaintenanceTaskUpdate, MaintenanceTaskResponse

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

@router.get("", response_model=List[MaintenanceTaskResponse])
def get_maintenance_tasks(
    status: Optional[str] = Query(None, description="UPCOMING, RECOMMENDED, SCHEDULED, IN_PROGRESS, COMPLETED"),
    priority: Optional[str] = Query(None, description="CRITICAL, HIGH, MEDIUM, LOW"),
    machine_id: Optional[str] = Query(None, description="Filter by machine ID"),
    db: Session = Depends(get_db)
):
    query = db.query(MaintenanceTask)
    
    if status and status.upper() != "ALL":
        query = query.filter(MaintenanceTask.status == status.upper())
    if priority and priority.upper() != "ALL":
        query = query.filter(MaintenanceTask.priority == priority.upper())
    if machine_id:
        query = query.filter(MaintenanceTask.machine_id == machine_id)
        
    tasks = query.order_by(MaintenanceTask.scheduled_date.asc()).all()
    
    results = []
    for t in tasks:
        m = db.query(Machine).filter(Machine.id == t.machine_id).first()
        results.append(MaintenanceTaskResponse(
            id=t.id,
            machine_id=t.machine_id,
            machine_name=m.name if m else t.machine_id,
            title=t.title,
            description=t.description,
            priority=t.priority,
            status=t.status,
            category=t.category,
            scheduled_date=t.scheduled_date,
            completed_date=t.completed_date,
            assigned_technician=t.assigned_technician,
            estimated_hours=t.estimated_hours,
            notes=t.notes,
            created_at=t.created_at
        ))
    return results

@router.post("", response_model=MaintenanceTaskResponse)
def create_maintenance_task(task_in: MaintenanceTaskCreate, db: Session = Depends(get_db)):
    machine = db.query(Machine).filter(Machine.id == task_in.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {task_in.machine_id} not found")

    new_id = f"MNT-{random.randint(1000, 9999)}"
    sched_date = task_in.scheduled_date or (datetime.datetime.utcnow() + datetime.timedelta(days=2))

    task = MaintenanceTask(
        id=new_id,
        machine_id=task_in.machine_id,
        title=task_in.title,
        description=task_in.description,
        priority=task_in.priority.upper(),
        status=task_in.status.upper() if task_in.status else "SCHEDULED",
        category=task_in.category or "Predictive",
        scheduled_date=sched_date,
        assigned_technician=task_in.assigned_technician or "Escorts Kubota Maintenance Team",
        estimated_hours=task_in.estimated_hours or 2.0,
        notes=task_in.notes
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return MaintenanceTaskResponse(
        id=task.id,
        machine_id=task.machine_id,
        machine_name=machine.name,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        category=task.category,
        scheduled_date=task.scheduled_date,
        completed_date=task.completed_date,
        assigned_technician=task.assigned_technician,
        estimated_hours=task.estimated_hours,
        notes=task.notes,
        created_at=task.created_at
    )

@router.put("/{task_id}", response_model=MaintenanceTaskResponse)
def update_maintenance_task(task_id: str, task_update: MaintenanceTaskUpdate, db: Session = Depends(get_db)):
    task = db.query(MaintenanceTask).filter(MaintenanceTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.priority is not None:
        task.priority = task_update.priority.upper()
    if task_update.status is not None:
        task.status = task_update.status.upper()
        if task.status == "COMPLETED" and not task.completed_date:
            task.completed_date = datetime.datetime.utcnow()
    if task_update.category is not None:
        task.category = task_update.category
    if task_update.scheduled_date is not None:
        task.scheduled_date = task_update.scheduled_date
    if task_update.completed_date is not None:
        task.completed_date = task_update.completed_date
    if task_update.assigned_technician is not None:
        task.assigned_technician = task_update.assigned_technician
    if task_update.estimated_hours is not None:
        task.estimated_hours = task_update.estimated_hours
    if task_update.notes is not None:
        task.notes = task_update.notes

    db.commit()
    db.refresh(task)

    machine = db.query(Machine).filter(Machine.id == task.machine_id).first()
    return MaintenanceTaskResponse(
        id=task.id,
        machine_id=task.machine_id,
        machine_name=machine.name if machine else task.machine_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        category=task.category,
        scheduled_date=task.scheduled_date,
        completed_date=task.completed_date,
        assigned_technician=task.assigned_technician,
        estimated_hours=task.estimated_hours,
        notes=task.notes,
        created_at=task.created_at
    )

