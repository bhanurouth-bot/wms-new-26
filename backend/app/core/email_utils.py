import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from typing import List
from starlette.background import BackgroundTasks

# --- CONFIGURATION ---
# In a real app, these come from os.getenv()
# For this tutorial, we will use a "Mock" mode if no credentials are found.

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "user@example.com"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "password"),
    MAIL_FROM = os.getenv("MAIL_FROM", "admin@pharma-os.com"),
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_recall_email_async(recipients: List[EmailStr], batch_number: str, product_name: str):
    """The actual heavy lifting function that talks to Gmail/Outlook"""
    
    html = f"""
    <h1>🚨 URGENT: DRUG RECALL NOTICE</h1>
    <p>This is an automated safety alert from PharmaOS.</p>
    <p><strong>Product:</strong> {product_name}</p>
    <p><strong>Batch Number:</strong> {batch_number}</p>
    <p>Please quarantine this stock immediately and return it to the manufacturer.</p>
    <br>
    <p><em>Secure Traceability System</em></p>
    """

    message = MessageSchema(
        subject=f"URGENT RECALL: {product_name} (Batch {batch_number})",
        recipients=recipients,
        body=html,
        subtype=MessageType.html
    )

    # If no real credentials, we just log it (Safety net for the tutorial)
    if os.getenv("MAIL_USERNAME") is None:
        print(f"------------ [MOCK EMAIL SENT] ------------")
        print(f"To: {recipients}")
        print(f"Subject: {message.subject}")
        print("-------------------------------------------")
        return

    fm = FastMail(conf)
    await fm.send_message(message)

def schedule_recall_notifications(background_tasks: BackgroundTasks, batch_number: str, product_name: str, customer_emails: List[str]):
    """Adds the email task to the background queue"""
    if not customer_emails:
        return
    
    # We can perform logic here, like splitting 5000 emails into chunks
    background_tasks.add_task(send_recall_email_async, customer_emails, batch_number, product_name)