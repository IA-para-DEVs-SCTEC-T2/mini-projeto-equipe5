Crie um projeto Spring Boot (Java 17, Maven) chamado "meu-crud".

Estrutura de pacotes:
com.exercicio.crud

controller
service
repository
model

Objetivo:
Implementar um CRUD simples em memória (sem banco de dados).

Objeto:
Classe Item com os campos:

Long id
String nome

Regras:

Usar lista em memória como repositório
ID deve ser gerado automaticamente (incremental)

Endpoints REST:

GET /items
Retorna lista de itens com status 200 ok
POST /items
Recebe JSON
Cria novo item
Retorna item criado com status 200 ok
DELETE /items/{id}
Remove item por ID
Retorna status 204 se removido

Arquivos esperados:

model/Item.java

model idem como record

repository/ItemRepository.java

lista em memória
métodos: findAll, save, deleteById

service/ItemService.java

lógica de negócio

controller/ItemController.java

endpoints REST

Classe principal:
CrudApplication.java com @SpringBootApplication

Extras:

Usar @RestController
Usar @RequestBody e @PathVariable corretamente
Retornar ResponseEntity quando necessário para status code de response

Não usar banco de dados nem JPA.