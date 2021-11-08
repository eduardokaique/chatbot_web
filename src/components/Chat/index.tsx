import { FormEvent, useEffect, useState } from 'react';
import Loader from 'react-loader-spinner';
import { io } from 'socket.io-client';
import { api } from '../../services/api';
import styles from  './styles.module.scss'
import avatar_cliente from '../../assets/avatar_cliente.png'
import avatar_usuario from '../../assets/user-profile1.jpeg'

export function Chat(){
    type MenuAtendimento = {
        id: string;
        opcao: string | null;
        descricao: string;
        grupoAtendimentoId: string | null;
    }

    type Mensagem = {
        id: string | null;
        texto: string;
        autor: string;
        avatar_url: string;
    }
    

    const messageQueue: Mensagem[] = [];
    const date = new Date();
    const socket = io('https://chatbot-api-ifsp.herokuapp.com');

    socket.on('new_message', (newMessage:Mensagem) =>  {
        messageQueue.push(newMessage);
    })

    const [enviada, setEnviada] = useState<boolean>(false)
    const [messages, setMessages] = useState<Mensagem[]>([])
    const [menuAtendimento, setMenuAtendimento] = useState<MenuAtendimento[]>([])
    const [mensagemCliente, setMensagemCliente] = useState<string>('');
    const [ultimoMenuAtedimentoSelecionado, setUltimoMenuAtedimentoSelecionado] = useState<MenuAtendimento | null>();
    const [mensagem, setMensagem] = useState<Mensagem | null>()

    useEffect(() => {
        setTimeout(() => {
             setMensagem( 
                 {
                     id: null,
                     texto: "Bem vindo ao atendimento da empresa XXXXX. Selecione a opção desejada:",
                     autor: `Bot • ${date.getHours()}:${date.getMinutes()}`,
                     avatar_url: avatar_usuario
                 }
            )
            
        }, 2000)  
    },[])

    useEffect(() => {

        setTimeout(() => {
            
            api.get<MenuAtendimento[]>('menus').then(response => {
                
                setMenuAtendimento(response.data);
            })
            
         }, 2000)

    }, [])

    useEffect(()=>{
        setInterval(() => {
            if(messageQueue.length >0){
                setMessages(messageQueue)
            }
        }, 1000)
    },[])

    async function handleSubMenus(event: FormEvent, menuAtendimentoId: string) {
        event.preventDefault();

        let menu = menuAtendimento.filter(menu => menu.id == menuAtendimentoId 
            && menu.grupoAtendimentoId != null)

        setUltimoMenuAtedimentoSelecionado(menu[0])

        if(menu.some(a => a)){
            setMensagem(
            {
                id: null,
                texto: "Você será transferido para o atendimento especializado... Aguarde",
                autor: `Bot • ${date.getHours()}:${date.getMinutes()}`,
                avatar_url: avatar_usuario
            })
            setMenuAtendimento([])
        }else {
            const response = await api.post<MenuAtendimento[]>('submenus', {parentMenuId: menuAtendimentoId})
            setMenuAtendimento(response.data)
        }
    }

    function menuAnterior(menus: MenuAtendimento[]){
        menus.push({
            id: "9",
            descricao: "Voltar ao menu anterior.",
            opcao: "9",
            grupoAtendimentoId: null
            
        })

        return menus;
    }

    async function handleMensagem (event: FormEvent){

        if(!mensagemCliente.trim()){
            return;
        }
        event.preventDefault();
        await api.post('messages', {
            mensagem: mensagemCliente,
            grupoAtendimentoId: ultimoMenuAtedimentoSelecionado?.grupoAtendimentoId
        })
        setMensagemCliente('')
        setEnviada(true);

    }
    
    return (
        
        <div className={styles.container}>
        <div className="col-md-3">
            <div className="col-xs-12">
                <form onSubmit={handleMensagem}> 
                    <div className={`panel panel-default ${styles.panelCustom}`}>
                        <div className={`panel-heading ${styles.btnMinimize}`}>
                            <div className="col-xs-8">
                                <h2 className="panel-title">
                                    <span className="glyphicon glyphicon-comment"></span> Atendimento ao Cliente</h2>
                            </div>
                            <div>
                                <a href="#"><span id="minim_chat_window" className="glyphicon glyphicon-minus icon_minim"></span></a>
                            </div>
                        </div>
                        <div className="panel-body msg_container_base">
                                <div className={`row msg_container base_sent }`}>
                                    <div className="col-md-10 col-xs-10">
                                        <div className={`rmessages msg_sent ${styles.spaceBetweenMessage}}`}>
                                            <Loader type="ThreeDots" color="black" height={30} width={30} timeout={2000} /> 
                                            <p>{mensagem?.texto}</p>
                                            { menuAtendimento.map(menuAtendimento => {
                                                return (
                                                        <div key={menuAtendimento.id}>
                                                            <a onClick={(e) => handleSubMenus(e, menuAtendimento.id)}>
                                                                {menuAtendimento.opcao} - {menuAtendimento.descricao}
                                                            </a>
                                                        </div>
                                                )}
                                            )}
                                        <time dateTime={date.toString()}>{mensagem?.autor}</time>
                                        </div>
                                    </div>
                                    <div className="col-md-2 col-xs-2 avatar">
                                        <img src={mensagem?.avatar_url} className="img-responsive "/>
                                    </div>
                                </div>
                                {!!enviada ?
                                messages.map(message => {
                                    return (
                                        <div className="row msg_container base_receive">
                                            <div className="col-md-2 col-xs-2 avatar">
                                                <img src={avatar_cliente} className=" img-responsive "/>
                                            </div>
                                            <div className="col-md-10 col-xs-10">
                                                <div className="messages msg_receive">
                                                    <p>{message.texto}</p>
                                                    <time dateTime={`${date.getHours()}:${date.getMinutes()}`}>Cliente • {`${date.getHours()}:${date.getMinutes()}`}</time>
                                                </div>
                                            </div>
                                        </div> 
                                    )
                                })
                                
                                : <div></div>
                                }
                        </div>
                        <div className="panel-footer">
                            <div className="input-group">
                                <input value={mensagemCliente} onChange={event => setMensagemCliente(event.target.value)} id="btn-input" type="text" className="form-control input-sm chat_input" placeholder="Escreva sua mensagem aqui..." />
                                <span className="input-group-btn">
                                <button type="submit" className="btn btn-primary btn-sm" id="btn-chat">Enviar</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
    );
}

