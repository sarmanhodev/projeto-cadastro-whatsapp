from main import db, app
from flask_login import UserMixin
from datetime import datetime


class Alunos(db.Model, UserMixin):
    __tablename__ = "alunos"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(256), unique=True, nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    telefone = db.Column(db.String(256), unique=True, nullable=True)
    idade = db.Column(db.Integer, nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    cpf = db.Column(db.String(50), unique=True, nullable=True)

    mensagens = db.relationship(
        "Mensagens",
        back_populates="aluno",
        order_by="desc(Mensagens.datahora_envio)",
        cascade="all, delete-orphan",
    )


class Mensagens(db.Model, UserMixin):
    __tablename__ = "mensagens"

    id = db.Column(db.Integer, primary_key=True)

    aluno_id = db.Column(db.Integer, db.ForeignKey("alunos.id"), nullable=False)

    mensagem = db.Column(db.Text, nullable=False)

    datahora_envio = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    aluno = db.relationship("Alunos", back_populates="mensagens")
