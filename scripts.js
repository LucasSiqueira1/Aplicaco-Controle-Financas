//Abre ou fecha o modelo (nova transação)
const modelo = {
    open() {
        document.querySelector('.modeloTransacao').classList.add('ativo')
    },
    close() {
        document.querySelector('.modeloTransacao').classList.remove('ativo')
    }
}

//Salva os dados no próprio navegador
const salvarNoNav = {
    get() {
        return JSON.parse(localStorage.getItem("financas:transacoes")) || []
    },
    set(transacao) {
        //LOCALSTORAGE guarda no navegador como string
        //Então tenho que usar o JSON.stringify, vai ficar guardado como string
        localStorage.setItem("financas:transacoes", JSON.stringify(transacao));
    }

}


//Soma entradas, saídas, e o total
const transacao = {
    all: salvarNoNav.get(),

    add(transaction) {
        transacao.all.push(transaction);
        aplicacao.reload()
    },

    remover(index) {
        transacao.all.splice(index, 1)
        aplicacao.reload()
    },

    entradas() {
        let entradas = 0;

        transacao.all.forEach((transacao) => {
            if (transacao.valor > 0) {
                entradas += transacao.valor
            }
        })
        return entradas;
    },

    saidas() {
        let saidas = 0;

        transacao.all.forEach((transacao) => {
            if (transacao.valor < 0) {
                saidas += transacao.valor
            }
        })
        return saidas
    },
    total() {
        let total = 0;
        total = transacao.entradas() + transacao.saidas()

        return total
    },
}



//Simulando a DOM
const DOM = {
    transactionContainer: document.querySelector('#table tbody'),

    addTransacao(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) //retorna html da função abaixo
        tr.dataset.index = index
        DOM.transactionContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {
        const verificaco = transaction.valor > 0 ? "entrada" : "despesa"

        const valor = ferramentas.format(transaction.valor)

        const html = `
            <td class="descricao">${transaction.descricao}</td>
            <td class="${verificaco}">${valor}</td>
            <td class="data">${transaction.data}</td>
            <td><img onClick = "transacao.remover(${(index)})"src="./imagens/minus.svg" alt="Remover Transação"></td>
        `
        return html
    },


    atualizarBalanco() {
        document.getElementById('entradaDisplay').innerHTML = ferramentas.format(transacao.entradas())
        document.querySelector('#saidaDisplay').innerHTML = ferramentas.format(transacao.saidas())
        document.getElementById('totalDisplay').innerHTML = ferramentas.format(transacao.total())
    },

    limparTransacao() {
        DOM.transactionContainer.innerHTML = ""
    }
}


//Manipula número para real, formata o dinheiro
const ferramentas = {
    format(valor) {
        const sinal = Number(valor) < 0 ? "-" : ""

        valor = String(valor).replace(/\D/g, "") // /\D/g, D significa -> ache tudo que não é numero de forma global
        valor = Number(valor) / 100
        valor = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return sinal + valor;
    },

    formatValor(valor) {
        return valor = Number(valor) * 100
    },

    formatData(data) {
        //A data vai pro "server" invertida, ano - mes - dia
        const separarData = data.split("-") //removendo os traços
        return `${separarData[2]}/${separarData[1]}/${separarData[0]}`
    }
}



const formulario = {
    descricao: document.querySelector('input#descricao'),
    valor: document.querySelector('input#valor'),
    data: document.querySelector('input#data'),

    getValores() {
        return { //obs, esse value nao existe em lugar nenhum, e não pode ser 'valor', para não dar conflito
            descricao: formulario.descricao.value,
            valor: formulario.valor.value,
            data: formulario.data.value,
        }
    },


    //Verificar se todas as informações foram preenchidas
    verificarInfo() {
        const {
            descricao,
            valor,
            data
        } = formulario.getValores()

        //Trim faz uma limpeza dos espaços vazios que tem na string
        if (descricao.trim() === "" || valor.trim() === "" || data.trim() === "") {
            throw new Error("Preencha todos os dados!")
        }
    },

    //Formatar os dados
    formatarInfo() {
        let {
            descricao,
            valor,
            data
        } = formulario.getValores()
        valor = ferramentas.formatValor(valor)
        data = ferramentas.formatData(data)

        return {
            descricao,
            valor,
            data
        }
    },

    limparDados() {
        formulario.descricao.value = ""
        formulario.valor.value = ""
        formulario.data.value = ""
    },

    submit(event) {
        event.preventDefault()

        //Tratamento de erro
        try {
            //verificar informações
            formulario.verificarInfo()

            //formatar transações
            const transacaoFormatada = formulario.formatarInfo()

            //salvar os dados
            transacao.add(transacaoFormatada)

            //apagar o form, caso eu queira colocar outra transação
            formulario.limparDados()

            //fechar o modelo
            modelo.close()

        } catch (error) {
            alert(error.message);
        }
    }
}


//"main" da minha aplicação
const aplicacao = {
    init() {
        transacao.all.forEach((transaction, index) => {
            DOM.addTransacao(transaction, index)
        })

        DOM.atualizarBalanco()

        salvarNoNav.set(transacao.all)
    },

    reload() {
        DOM.limparTransacao()
        aplicacao.init()
    }
}

aplicacao.init()