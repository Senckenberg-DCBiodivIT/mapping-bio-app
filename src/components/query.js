export const query = {
  firstLevelClass: `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
        SELECT ?subject ?label
        WHERE {
        ?subject a owl:Class .
        ?subject rdfs:label ?label .
        
        FILTER NOT EXISTS { ?subject owl:deprecated "true"^^<http://www.w3.org/2001/XMLSchema#boolean> }
        FILTER NOT EXISTS { ?subject rdfs:subClassOf ?any }
    }
    `,

  subclassOf: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
        SELECT ?class ?hasSubClasses? ?aSubclassID, ?aSubclassLabel
        WHERE {
        ?class rdfs:subClassOf <ID_HERE> .

        BIND (EXISTS{?anysubclass rdfs:subClassOf ?<ID_HERE>} AS ?hasSubClasses)
        #BIND(IF(?hasSubClasses == true, ?anysubclass) as ?aSubclassID, ?aSubclassLabel )
    } 
  `,
};
