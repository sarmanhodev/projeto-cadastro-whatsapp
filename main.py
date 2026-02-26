from flask import *
from flask_sqlalchemy import SQLAlchemy as _BaseSQLAlchemy
from flask_cors import CORS
from sqlalchemy import *
import sqlalchemy.exc as db_exc
from tables import *


class SQLAlchemy(_BaseSQLAlchemy):
    def apply_pool_defaults(self, app, options):
        super(SQLAlchemy, self).apply_pool_defaults(self, app, options)
        options["pool_pre_ping"] = True


db = SQLAlchemy()
app = Flask(__name__, template_folder="./templates")
app.jinja_env.variable_start_string = "[["
app.jinja_env.variable_end_string = "]]"


CORS(app)  # Habilita CORS globalmente para todas as rotas
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:[SENHA_DATABASE]@localhost:[PORTA]/[DATABASE_NAME]"
)

app.config["SECRET_KEY"] = "secret"
db.init_app(app)


@app.route("/")
def home():
    alunos = db.session.query(Alunos).all()

    return render_template("home.html", alunos=alunos)


@app.route("/lerDados", methods=["GET"])
def lerDados():
    try:
        # parâmetros de paginação
        page = request.args.get("page", default=1, type=int)
        per_page = request.args.get("per_page", default=10, type=int)

        query = db.session.query(Alunos)

        total = query.count()

        alunos = (
            query.order_by(Alunos.id)
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )

        alunos_json = [
            {
                "id": dados.id,
                "nome": dados.nome,
                "dataNascimento": dados.data_nascimento.strftime("%Y-%m-%d"),
                "idade": dados.idade,
                "email": dados.email,
                "telefone": dados.telefone,
                "cpf": dados.cpf,
            }
            for dados in alunos
        ]

        return (
            jsonify(
                {
                    "alunos_json": alunos_json,
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": (total + per_page - 1) // per_page,
                }
            ),
            200,
        )

    except Exception as e:
        print(f"Erro ao processar a solicitação: {e}")
        return jsonify({"error": "Erro ao processar a solicitação"}), 500


# INSERT
@app.route("/cadastrar", methods=["POST"])
def cadastrarDados():
    dados_dict = request.get_json()

    if request.method == "POST":
        try:
            aluno_nome = dados_dict["nome"].strip().lower().title()
            aluno_email = dados_dict["email"]
            aluno_telefone = dados_dict["telefone"]
            aluno_idade = dados_dict["idade"]
            aluno_dtnascimento = dados_dict["data_nascimento"]
            aluno_cpf = dados_dict["cpf"]

            # verificar se o aluno encontra-se cadastrado
            verifica_aluno = (
                db.session.query(Alunos).filter(Alunos.cpf == aluno_cpf).first()
            )

            if verifica_aluno:
                return (
                    jsonify(
                        {
                            "message": f"Atenção! O aluno {verifica_aluno.nome}, portador do CPF de nº {verifica_aluno.cpf}, já encontra-se cadastrado em nossa base de dados."
                        }
                    ),
                    200,
                )

            novo_aluno = Alunos(
                nome=aluno_nome,
                email=aluno_email,
                telefone=aluno_telefone,
                idade=aluno_idade,
                data_nascimento=aluno_dtnascimento,
                cpf=aluno_cpf,
            )
            db.session.add(novo_aluno)
            db.session.commit()

            return jsonify({"message": "Dados cadastrados com sucesso."}), 200

        except db_exc.SQLAlchemyError as e:
            db.session.rollback()
            return (
                jsonify(
                    {"status": "error", "message": "Erro ao cadastrar", "error": str(e)}
                ),
                500,
            )

        except Exception as e:
            return (
                jsonify(
                    {"status": "error", "message": "Erro inesperado", "error": str(e)}
                ),
                500,
            )


# EDITAR
@app.route("/editar_registro/<int:aluno_id>", methods=["GET", "POST"])
def editar_registro(aluno_id):
    aluno = db.session.query(Alunos).filter(Alunos.id == aluno_id).first()
    dados_aluno = request.get_json()

    if request.method == "POST":
        try:
            aluno.nome = dados_aluno["nome"]
            aluno.email = dados_aluno["email"]
            aluno.telefone = dados_aluno["telefone"]
            aluno.idade = dados_aluno["idade"]
            aluno.data_nascimento = dados_aluno["data_nascimento"]
            aluno.cpf = dados_aluno["cpf"]

            db.session.commit()

            return (
                jsonify(
                    {"message": f"Dados do aluno {aluno.nome} atualizados com sucesso."}
                ),
                200,
            )

        except db_exc.SQLAlchemyError as e:
            db.session.rollback()
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Erro ao atualizar registro",
                        "error": str(e),
                    }
                ),
                500,
            )

        except Exception as e:
            return (
                jsonify(
                    {"status": "error", "message": "Erro inesperado", "error": str(e)}
                ),
                500,
            )


# DELETAR
@app.route("/deletar_registro/<int:aluno_id>", methods=["GET", "POST"])
def deletar_registro(aluno_id):

    if request.method == "POST":
        try:
            aluno = db.session.query(Alunos).filter(Alunos.id == aluno_id).first()
            db.session.delete(aluno)
            db.session.commit()

            return (
                jsonify(
                    {
                        "message": f"O registro do aluno {aluno.nome} excluído com sucesso."
                    }
                ),
                200,
            )

        except db_exc.SQLAlchemyError as e:
            db.session.rollback()
            return (
                jsonify(
                    {"status": "error", "message": "Erro ao cadastrar", "error": str(e)}
                ),
                500,
            )

        except Exception as e:
            return (
                jsonify(
                    {"status": "error", "message": "Erro inesperado", "error": str(e)}
                ),
                500,
            )


# Ler histórico de mensagens
@app.route("/ler_historico", methods=["GET", "POST"])
def ler_historico():
    dados_dict = request.get_json()

    try:
        if not dados_dict or "alunoId" not in dados_dict:
            return jsonify({"status": "error", "message": "alunoId não informado"}), 400

        aluno_id = dados_dict["alunoId"]

        mensagens_aluno = db.session.query(Alunos).filter(Alunos.id == aluno_id).first()

        if not mensagens_aluno:
            return jsonify({"status": "error", "message": "Aluno não encontrado"}), 404

        mensagens = [
            {
                "id": msg.id,
                "mensagem": msg.mensagem,
                "datahora_envio": msg.datahora_envio.strftime("%d/%m/%Y %H:%M"),
            }
            for msg in mensagens_aluno.mensagens
        ]

        return (
            jsonify(
                {
                    "status": "success",
                    "aluno_id": aluno_id,
                    "nome": mensagens_aluno.nome,
                    "mensagens": mensagens,
                }
            ),
            200,
        )

    except Exception as e:
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Erro ao buscar histórico",
                    "error": str(e),
                }
            ),
            500,
        )


# Salvar mensagem enviada
@app.route("/salvar_mensagem", methods=["POST"])
def salvar_mensagem():
    try:
        dados_dict = request.get_json()

        if not dados_dict:
            return jsonify({"status": "error", "message": "Payload inválido"}), 400

        aluno_id = dados_dict.get("aluno_id")
        texto_mensagem = dados_dict.get("mensagem")

        if not aluno_id or not texto_mensagem:
            return (
                jsonify(
                    {"status": "error", "message": "Aluno e mensagem são obrigatórios"}
                ),
                400,
            )

        aluno = db.session.query(Alunos).filter(Alunos.id == aluno_id).first()

        if not aluno:
            return jsonify({"status": "error", "message": "Aluno não encontrado"}), 404

        msg = Mensagens(
            aluno_id=aluno.id,
            mensagem=texto_mensagem.strip(),
            datahora_envio=datetime.now(),
        )

        db.session.add(msg)
        db.session.commit()

        return (
            jsonify(
                {
                    "status": "success",
                    "message": f"Mensagem enviada com sucesso para o aluno {aluno.nome}.",
                    "data": {
                        "mensagem_id": msg.id,
                        "aluno_id": aluno.id,
                        "datahora_envio": msg.datahora_envio.isoformat(),
                    },
                }
            ),
            201,
        )

    except db_exc.SQLAlchemyError as e:
        db.session.rollback()
        return (
            jsonify(
                {
                    "status": "error",
                    "message": "Erro ao salvar mensagem",
                    "error": str(e),
                }
            ),
            500,
        )

    except Exception as e:
        return (
            jsonify({"status": "error", "message": "Erro inesperado", "error": str(e)}),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

