const { createApp, ref, watch, onMounted } = Vue;

createApp({
    setup() {
        // Variáveis reativas
        const alunoId = ref(null);
        const nomeAluno = ref('');
        const emailAluno = ref('');
        const cpfAluno = ref('');
        const telefoneAluno = ref('');
        const dataNascimento = ref('');
        const idade = ref('');
        const dados = ref({ alunos_json: [] });
        const carregando = ref(false);
        const modoEdicao = ref(false);
        const alunoEditandoId = ref(null);
        const mostrarAlert = ref(false);
        const alertTipo = ref('');
        const alertMensagem = ref('');
        const paginaAtual = ref(1);
        const totalPaginas = ref(1);
        const totalRegistros = ref(0);
        const porPagina = 10;
        const mensagem = ref('');
        const textMessage = ref({
            textMessage: false
        });
        const historico_mensagens = ref([]);
        const carregandoMensagens = ref(false);

        const tocado = ref({
            nomeAluno: false,
            cpfAluno: false,
            emailAluno: false,
            telefoneAluno: false,
            dataNascimento: false
        });

        const erros = ref({
            nomeAluno: false,
            cpfAluno: false,
            emailAluno: false,
            telefoneAluno: false,
            dataNascimento: false
        });


        watch(nomeAluno, (valor) => {
            erros.value.nomeAluno = !valor;
        });

        watch(cpfAluno, (valor) => {
            const cpfLimpo = valor.replace(/\D/g, '');
            erros.value.cpfAluno = cpfLimpo.length !== 11;
        });

        watch(emailAluno, (valor) => {
            erros.value.emailAluno = !valor;
        });

        watch(telefoneAluno, (valor) => {
            erros.value.telefoneAluno = !valor;
        });

        watch(dataNascimento, (valor) => {
            erros.value.dataNascimento = !valor;
        });


        watch(idade, (valor) => {
            erros.value.idade = !valor;
        });

        const validarFormulario = () => {
            erros.value = {
                nomeAluno: !nomeAluno.value,
                cpfAluno: !cpfAluno.value || cpfAluno.value.replace(/\D/g, '').length !== 11,
                emailAluno: !emailAluno.value,
                telefoneAluno: !telefoneAluno.value || telefoneAluno.value.replace(/\D/g, '').length < 10,
                dataNascimento: !dataNascimento.value,
                idade: !idade.value
            };

            // se algum erro for true, formulário inválido
            return !Object.values(erros.value).includes(true);
        };

        const validarEnvioMensagem = () => {
            textMessage.value.textMessage = mensagem.value.trim() === '';
            return !textMessage.value.textMessage;
        };

        const fecharModal = () => {
            const modalEl = document.getElementById('modalAdicionarCadastro');

            if (!modalEl) return;

            const modalInstance =
                bootstrap.Modal.getInstance(modalEl) ||
                new bootstrap.Modal(modalEl);

            modalInstance.hide();
        };

        const fecharModalDeletar = () => {
            const modalEl = document.getElementById('modalExcluirCadastro');

            if (!modalEl) return;

            const modalInstance =
                bootstrap.Modal.getInstance(modalEl) ||
                new bootstrap.Modal(modalEl);

            modalInstance.hide();
        };

        const fecharModalMensagem = () => {
            const modalEl = document.getElementById('modalMensagem');

            if (!modalEl) return;

            const modalInstance =
                bootstrap.Modal.getInstance(modalEl) ||
                new bootstrap.Modal(modalEl);

            modalInstance.hide();
        };

        const limparFormulario = () => {
            nomeAluno.value = '';
            emailAluno.value = '';
            cpfAluno.value = '';
            telefoneAluno.value = '';
            dataNascimento.value = '';
            idade.value = '';
        };

        const formatarData = (data) => {
            return moment(data).format('DD/MM/YYYY');
        };

        const formatarTelefone = (telefone) => {
            if (!telefone) return '';

            // remove tudo que não for número
            let numeros = telefone.replace(/\D/g, '');


            // limita a 11 dígitos
            numeros = numeros.slice(0, 11);


            if (numeros.length === 11) {
                // celular
                return numeros.replace(
                    /(\d{2})(\d{5})(\d{4})/,
                    '($1) $2-$3'
                );
            }

            if (numeros.length === 10) {
                // fixo
                return numeros.replace(
                    /(\d{2})(\d{4})(\d{4})/,
                    '($1) $2-$3'
                );
            }

            // fallback
            return telefone;
        };

        const formatarEmail = (email) => {
            if (!email) return '';

            return email
                .toLowerCase()               // email não é case sensitive
                .replace(/\s+/g, '')         // remove espaços
                .replace(/[^a-z0-9@._+-]/g, ''); // remove caracteres inválidos
        };

        const validarEmail = (email) => {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        };

        const formatarCPF = (valor) => {
            if (!valor) return '';

            // remove tudo que não for número
            let cpf = valor.replace(/\D/g, '');

            // limita a 11 dígitos
            cpf = cpf.slice(0, 11);

            // aplica a máscara
            cpf = cpf.replace(/^(\d{3})(\d)/, '$1.$2');
            cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

            return cpf;
        };

        // Métodos
        const calcularIdade = () => {//FAZ O CÁLCULO DA IDADE, COM BASE NA DATA DE NASCIMENTO
            if (dataNascimento.value) {
                const dataAtual = moment();
                const dataFormatada = moment(dataNascimento.value);
                idade.value = dataAtual.diff(dataFormatada, 'years');
            }
        };

        const novoCadastro = () => {
            modoEdicao.value = false;
            alunoEditandoId.value = null;
            limparFormulario();

            tocado.value = {
                nomeAluno: false,
                cpfAluno: false,
                emailAluno: false,
                telefoneAluno: false,
                dataNascimento: false
            };

            erros.value = {
                nomeAluno: false,
                cpfAluno: false,
                emailAluno: false,
                telefoneAluno: false,
                dataNascimento: false
            };

            const modalEl = document.getElementById('modalAdicionarCadastro');
            new bootstrap.Modal(modalEl).show();
        };

        const editarAluno = (aluno) => {
            modoEdicao.value = true;
            alunoEditandoId.value = aluno.id;
            cpfAluno.value = aluno.cpf;
            nomeAluno.value = aluno.nome;
            emailAluno.value = aluno.email;
            telefoneAluno.value = aluno.telefone;
            dataNascimento.value = aluno.dataNascimento;

            calcularIdade();

            const modalEl = document.getElementById('modalAdicionarCadastro');
            new bootstrap.Modal(modalEl).show();
        };


        const abrirModalMensagem = (aluno) => {
            alunoId.value = aluno.id;
            cpfAluno.value = aluno.cpf;
            nomeAluno.value = aluno.nome;
            emailAluno.value = aluno.email;
            telefoneAluno.value = aluno.telefone;
            dataNascimento.value = aluno.dataNascimento;

            mensagem.value = '';
            textMessage.value.textMessage = false;

            // carrega histórico (mas NÃO ativa a aba)
            lerHistoricoMensagens(aluno.id);

            const modalEl = document.getElementById('modalMensagem');
            const modal = new bootstrap.Modal(modalEl);
            modal.show();

            // 🔥 FORÇAR TAB "ENVIAR MENSAGEM"
            const enviarTabBtn = document.getElementById('enviar-tab');
            const tab = new bootstrap.Tab(enviarTabBtn);
            tab.show();
        };


        const excluirAluno = (aluno) => {
            alunoEditandoId.value = aluno.id;
            cpfAluno.value = aluno.cpf;
            nomeAluno.value = aluno.nome;
            emailAluno.value = aluno.email;
            telefoneAluno.value = aluno.telefone;
            dataNascimento.value = aluno.dataNascimento;
            idade.value = aluno.idade;

            const modalEl = document.getElementById('modalExcluirCadastro');

            const modalInstance =
                bootstrap.Modal.getInstance(modalEl) ||
                new bootstrap.Modal(modalEl);

            modalInstance.show();
        };

        const getDados = (page = 1) => {
            carregando.value = true
            paginaAtual.value = page

            fetch(`/lerDados?page=${page}&per_page=${porPagina}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na resposta do servidor')
                    }
                    return response.json()
                })
                .then(data => {
                    dados.value = data
                    totalRegistros.value = data.total
                    totalPaginas.value = data.total_pages

                })
                .catch(error => {
                    console.error('Error:', error)
                    dados.value = { alunos_json: [] }
                })
                .finally(() => {
                    carregando.value = false
                })
        }

        const enviarDados = () => {
            if (!validarFormulario()) {
                return;
            }

            const payload = {
                nome: nomeAluno.value,
                cpf: cpfAluno.value.replace(/\D/g, ''),
                email: emailAluno.value,
                telefone: telefoneAluno.value,
                data_nascimento: dataNascimento.value,
                idade: idade.value
            };

            const url = modoEdicao.value
                ? `/editar_registro/${alunoEditandoId.value}`
                : '/cadastrar';

            const method = 'POST';

            fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(r => r.json())
                .then(resposta => {
                    getDados();
                    fecharModal();
                    limparFormulario();

                    // usa a mensagem retornada pelo Flask
                    alertMensagem.value = resposta.message;

                    // define o tipo do alerta
                    alertTipo.value = modoEdicao.value ? 'info' : 'success';

                    mostrarAlert.value = true;

                    // opcional: esconder sozinho após 4s
                    setTimeout(() => {
                        mostrarAlert.value = false;
                    }, 4000);
                })
                .catch(console.error);
        };


        const excluirRegistro = () => {
            const url = `/deletar_registro/${alunoEditandoId.value}`;

            fetch(url, {
                method: 'POST', // ou DELETE, se seu backend aceitar
                headers: { 'Content-Type': 'application/json' }
            })
                .then(r => r.json())
                .then(resposta => {
                    getDados();
                    fecharModalDeletar();
                    limparFormulario();

                    let mensagem = resposta.message;

                    alertTipo.value = 'danger';
                    alertMensagem.value = mensagem;
                    mostrarAlert.value = true;

                    setTimeout(() => {
                        mostrarAlert.value = false;
                    }, 4000);
                })
                .catch(console.error);
        };


        const enviarMensagem = () => {
            if (!validarEnvioMensagem()) {
                return;
            }

            const telefone = telefoneAluno.value.replace(/\D/g, '');
            const texto = mensagem.value;

            const payload = {
                aluno_id: alunoId.value,
                mensagem: texto
            };

            fetch('/salvar_mensagem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(r => r.json())
                .then(resposta => {
                    if (resposta.status !== 'success') {
                        throw new Error(resposta.message);
                    }

                    // feedback visual
                    alertMensagem.value = resposta.message;
                    alertTipo.value = 'success';
                    mostrarAlert.value = true;

                    setTimeout(() => {
                        mostrarAlert.value = false;
                    }, 4000);

                    // abre o WhatsApp APÓS salvar
                    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(texto)}`;
                    window.open(url, '_blank');

                    // fecha e limpa modal
                    fecharModalMensagem();
                    mensagem.value = '';
                })
                .catch(error => {
                    console.error(error);
                    alertMensagem.value = 'Erro ao enviar mensagem';
                    alertTipo.value = 'danger';
                    mostrarAlert.value = true;
                });
        };


        const lerHistoricoMensagens = (alunoId) => {
            carregandoMensagens.value = true;

            fetch('/ler_historico', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alunoId: alunoId
                })
            })
                .then(r => r.json())
                .then(resposta => {
                    if (resposta.status !== 'success') {
                        throw new Error(resposta.message);
                    }

                    historico_mensagens.value = resposta.mensagens;
                })
                .catch(error => {
                    console.error(error);
                    historico_mensagens.value = [];
                })
                .finally(() => {
                    carregandoMensagens.value = false;
                });
        };



        onMounted(() => {
            getDados()
        })


        return {
            nomeAluno,
            cpfAluno,
            emailAluno,
            telefoneAluno,
            dataNascimento,
            idade,
            modoEdicao,
            calcularIdade,
            enviarDados,
            getDados,
            novoCadastro,
            dados,
            formatarData,
            formatarTelefone,
            formatarCPF,
            editarAluno,
            excluirAluno,
            mostrarAlert,
            alertTipo,
            alertMensagem,
            excluirRegistro,
            fecharModalDeletar,
            formatarEmail,
            validarEmail,
            erros,
            tocado,
            carregando,
            paginaAtual,
            totalPaginas,
            totalRegistros,
            mensagem,
            textMessage,
            historico_mensagens,
            carregandoMensagens,
            abrirModalMensagem,
            enviarMensagem
        };
    },

}).mount('#app');