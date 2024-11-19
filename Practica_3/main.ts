// Update a document
import {MongoClient, ObjectId} from "mongodb"
// Replace the uri string with your MongoDB deployment's connection string
const url = Deno.env.get("N_MONGO")
if(!url){
  console.error("Debes definir la variable URL_MONGO")
  Deno.exit(1)
}
console.info(url)
const client = new MongoClient(url);

const handler = async (req: Request) : Promise<Response> =>{

  const biblioteca = client.db("pract_3");

  const books = biblioteca.collection("books");

  const Method = req.method
  const url = new URL(req.url)
  const path = url.pathname


  if(Method === "POST"){
    if(path === "/book"){
      const body =await req.json()
      if(!body.tittle || !body.author || !body.year){
        return new Response("Error: missing attributes")
      }
      const {insertedId} = await books.insertOne({
        tittle: body.tittle,
        author: body.author,
        year: body.year
      });

      return new Response(
        JSON.stringify({
          tittle: body.tittle,
          author: body.author,
          year: body.year,
          id: insertedId,
        }),
        { status: 201 }
      );
    }else{
      return new Response("Error: wrong path")
    }
  }else if(Method === "GET"){
    if(path === "/books"){
      let lista = await books.find().toArray();
      return new Response("Funciona: "+ JSON.stringify(lista))
    }else if (path.startsWith("/books/")){

      const id = path.split("/").pop()
      if (!id) return new Response("Bad request", { status: 400 });
      const result = await books.findOne({_id: new ObjectId(id)});
      if (!result){
      return new Response("no encontrado")
      }
      return new Response("id:: "+id+"\nobjeto"+ JSON.stringify(result))
    }else{
      return new Response("Error: wrong path")
    }
  }else if(Method === "PUT"){
    if (path.startsWith("/books/")){
      const id = path.split("/").pop();
      if (!id) return new Response("Bad request", { status: 400 });

      const libro = await req.json();

       let aux = await books.findOne({_id: new ObjectId(id)});

      if(!aux){return new Response(" AUX no encontrado", { status: 400 })}

      if(libro.tittle){
        aux.tittle = libro.tittle
      }
      if(libro.author){
        aux.author = libro.author
      }
      if(libro.year){
        aux.year = libro.year
      }
      
       const { modifiedCount } = await books.updateOne(

         { _id: new ObjectId(id as string)},
         { $set: aux } );
  
       
       return new Response("Libro actualizado correctamente", { status: 200 });
    }else{
      return new Response("Error: wrong path")
    }
  }else if(Method === "DELETE"){
    if (path.startsWith("/books/")){

      const id = path.split("/").pop()
      if (!id) return new Response("Bad request", { status: 400 });
      const res = await books.deleteOne({_id: new ObjectId(id)});
      if (res.deletedCount === 0){ 
        return new Response("Libro no encontradoe...", { status: 404 });
      }else{
        return new Response("Libro encontrado")
      }
    }else{
      return new Response("Error: wrong path")
    }
  }
  return new Response("url: "+ req.url+"\nlength: "+req.url.length+"\nat 22: "+req.url.at(22)+"\npath: "+path)
}

Deno.serve({port: 3000}, handler);