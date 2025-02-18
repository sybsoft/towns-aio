import email
import imaplib
import re

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel


class EmailRequest(BaseModel):
    host: str
    port: int
    email_address: str
    email_password: str


class EmailCodeParser:
    async def get_code(self, username, password, host, port):
        try:
            mail = imaplib.IMAP4_SSL(host)
            mail.login(username, password)

            mail.select("inbox")

            status, email_ids = mail.search(None, "(UNSEEN)")
            email_ids = email_ids[0].split()
            
            required_text = "is your login code for Towns"

            for email_id in email_ids[::-1]:
                status, message_data = mail.fetch(email_id, "(RFC822)")

                for response in message_data:
                    if isinstance(response, tuple):
                        msg = email.message_from_bytes(response[1])

                        if required_text in msg['subject']:
                            return msg['subject'].split(' ')[0]
                        else:
                            print("Code not found")
            
            mail.logout()
            return '0x'
        except Exception as e:
            print(e)
            return '0x'


    async def clear_email(self, username, password, host, port):
        try:
            mail = imaplib.IMAP4_SSL(host)
            mail.login(username, password)

            mail.select("inbox")

            status, messages = mail.search(None, "ALL")

            for num in messages[0].split():
                mail.store(num, '+FLAGS', '\\Deleted')

            mail.expunge()
            mail.logout()
        except Exception as e:
            print(e)
            return '0x'



app = FastAPI()

@app.post("/check_email")
async def check_email(request: EmailRequest):
    email_address = request.email_address
    password = request.email_password
    host = request.host
    port = request.port

    parser = EmailCodeParser()
    number = await parser.get_code(email_address, password, host, port)
    if number != '0x':
        return {"status": "success", "message": number}
    
    return {"status": "error", "message": "invalid"}


@app.post("/clear_email")
async def clear_email(request: EmailRequest):
    email_address = request.email_address
    password = request.email_password
    host = request.host
    port = request.port

    parser = EmailCodeParser()
    number = await parser.clear_email(email_address, password, host, port)
    if number != '0x':
        return {"status": "success", "message": number}
    
    return {"status": "error", "message": "invalid"}


@app.get("/ping")
async def ping():
    return {"status": "success"}