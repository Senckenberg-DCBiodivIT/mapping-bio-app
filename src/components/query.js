export const query = {
  testQuery: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
		    prefix skos:<http://www.w3.org/2004/02/skos/core#>

    SELECT ?subject ?predicate ?object
    WHERE {
      ?subject ?predicate ?object
    }
    `,

  getAllClasses_OWL: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
		    prefix skos:<http://www.w3.org/2004/02/skos/core#>

    SELECT ?subject ?predicate ?object
    WHERE {
      ?subject a owl:Class .
      ?subject ?predicate ?object
    }
    `,

  firstLevelClass_SKOS: `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
        prefix skos:<http://www.w3.org/2004/02/skos/core#>

        SELECT ?subject ?label
        WHERE {
          ?subject a skos:Concept .
          ?subject skos:prefLabel ?label .
          
          FILTER NOT EXISTS { ?subject skos:broader ?any }
    }
    `,

  firstLevelClass_OWL: `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
        prefix skos:<http://www.w3.org/2004/02/skos/core#>

        SELECT ?subject ?label
        WHERE {
          ?subject a owl:Class .
          ?subject rdfs:label ?label .
          
          FILTER NOT EXISTS { ?subject owl:deprecated "true"^^<http://www.w3.org/2001/XMLSchema#boolean> }
          FILTER NOT EXISTS { ?subject rdfs:subClassOf ?any }
    }
    `,

  subclassOf_OWL: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
        
        SELECT ?class ?label
        WHERE {
          
        ?class rdfs:subClassOf <ID_HERE> .
        ?class rdfs:label ?label .
    } 
  `,

  subclassOf_SKOS: `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
        prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
        prefix owl: <http://www.w3.org/2002/07/owl#>
        prefix skos:<http://www.w3.org/2004/02/skos/core#>

        
        SELECT ?class ?label
        WHERE {
          
        <ID_HERE> skos:narrower ?class .
        ?class skos:prefLabel ?label .
    } 
  `,

  mappingRow: `
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>

prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix align: <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#>

SELECT ?entity1 ?entity2 ?relation ?measure
WHERE {
  ?subject a align:Cell .
  
  ?subject align:entity1 ?entity1 .
  ?subject align:entity2 ?entity2 .
  
  ?subject align:relation ?relation .
  ?subject align:measure ?measure .
}
  `,

  getName: `
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>

prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> 
prefix align: <http://knowledgeweb.semanticweb.org/heterogeneity/alignment#>

SELECT ?name 
WHERE {
  <ID_HERE> rdfs:label ?name .
}
  `,
};
