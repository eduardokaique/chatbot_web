import axios from 'axios';

export const api  = axios.create({
    baseURL: 'https://chatbot-api-ifsp.herokuapp.com:4000/',
})