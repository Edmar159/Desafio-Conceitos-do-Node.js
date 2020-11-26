const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function validateId(request,response,next){
  const {id} = request.params;
 
  if (!isUuid(id)){
    return response.status(400).json({error: 'Invalid ID !'});
  }

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    
  if (repositoryIndex < 0){
      return response.status(400).json({error: 'Repository not found!'});
  }

  next();
};

function validateUrl(request,response,next){
  const {url} = request.body;
  
  if((url === undefined) || (url.indexOf('https://github.com/') === -1) ){
    return response.status(200).json({ error:'Invalid URL !'});
  }

  next();
};

function validateUrlUpdate(request,response,next){
  const {url} = request.body;
  if (url !== undefined){
    if( url.indexOf('https://github.com/') === -1){
      return response.status(200).json({ error:'Invalid URL !'});
    }
  }
  next();
};

app.get("/repositories", (request, response) => {
  // GET /repositories: Rota que lista todos os repositórios;
  return response.json(repositories);
});

app.post("/repositories",validateUrl,(request, response) => {
  // POST /repositories: A rota deve receber title, url e techs dentro do corpo da requisição, 
  // sendo a URL o link para o github desse repositório. Ao cadastrar um novo projeto, ele deve 
  // ser armazenado dentro de um objeto no seguinte formato: 
  // { id: "uuid", title: 'Desafio Node.js', url: 'http://github.com/...', 
  // techs: ["Node.js", "..."], likes: 0 }; 
  // Certifique-se que o ID seja um UUID, e de sempre iniciar os likes como 0.

  const {title, url, techs} = request.body;
  
  const repository = {id: uuid(), title,url,techs,likes: 0};
    
  repositories.push(repository);

  return response.json(repository);

});

app.patch("/repositories/:id", validateId,validateUrlUpdate, (request, response) => {
  // PUT /repositories/:id: A rota deve alterar apenas o title, a url e as techs do repositório que 
  // possua o id igual ao id presente nos parâmetros da rota;
  const {id} = request.params;
  const {title, url, techs, likes} = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  console.log(likes);
  
  if(likes > 0){
    const repository = {
      likes: repositories[repositoryIndex].likes}
      
    return response.json(repository);
  }else{
    const repository = {
        id,
        title: title ? title !== undefined : repositories[repositoryIndex].title,
        url: url ? url !== undefined : repositories[repositoryIndex].url,
        techs: techs ? techs !== undefined : repositories[repositoryIndex].techs,
        likes: repositories[repositoryIndex].likes
    }
    
    repositories[repositoryIndex] = repository;

    return response.json(repository);
  }
});

app.delete("/repositories/:id", validateId, (request, response) => {
  // DELETE /repositories/:id: A rota deve deletar o repositório com o id presente nos parâmetros da rota;
  const {id} = request.params;
  
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  repositories.splice(repositoryIndex, 1);
// usar 204 para conteudo vazio
  response.status(204).send();

});

app.post("/repositories/:id/like", validateId, (request, response) => {
  // POST /repositories/:id/like: A rota deve aumentar o número de likes do repositório específico escolhido
  // através do id presente nos parâmetros da rota, a cada chamada dessa rota, o número de likes deve ser 
  // aumentado em 1
  const {id} = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
    
    const repository = {
        id,
        title: repositories[repositoryIndex].title,
        url: repositories[repositoryIndex].url,
        techs: repositories[repositoryIndex].techs,
        likes: (repositories[repositoryIndex].likes + 1)
    }

    repositories[repositoryIndex] = repository;

    return response.json(repository);

});

module.exports = app;