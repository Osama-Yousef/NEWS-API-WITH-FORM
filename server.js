// requirement 
require('dotenv').config();

// dependencies 

const pg=require('pg');
const cors=require('cors');
const methodOverride=require('method-override');
const superagent=require('superagent');
const express=require('express');


// main variables

const PORT= process.env.PORT || 3030 ;
const client=new pg.Client(process.env.DATABASE_URL);
const app=express();

// uses 

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public')); 
app.set('view engine', 'ejs');

// app.use(errorHandler);
// app.use('*',notFoundHandler);


// listen to port

client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`listening on PORT ${PORT}`);
    })
})

/////////////////////
// check
app.get('/',homeHandler);
function homeHandler(req,res){

    res.status(200).send('IT WORKS') ;
}

///////////////////////////////////////



///////////////////////
// route definition 

app.get('/',homeHandler);

app.get('/search',searchHandler);

app.post('/addToDb',addToDbHandler);

app.get('/selectData',selectDataHandler);

app.get('/details/:new_id',detailsHandler);

app.put('/update/:update_id',updateHandler);

app.delete('/delete/:delete_id',deleteHandler);





/////////////////////// route handlers ///////////////////////////

function homeHandler(req,res){

res.render('index');

}

///////////////////////////////////

function searchHandler(req,res){

let title=req.query.title;
let type=req.query.radio;

let url=`https://newsapi.org/v2/${type}?q=${title}&apiKey=${process.env.NEWS_KEY}`;

superagent.get(url).then(data=>{

let newsArray=data.body.articles.map(val=>{

    return new News(val);
})

res.render('pages/result',{data: newsArray});

})

}

///////////////////////////////////////////////////////////
// constructor function 

function News(val){

this.title=val.title || 'no title';
this.author=val.author || 'no author';
this.image=val.urlToImage || 'no image';
this.description=val.description || '.........' ;

}

/////////////////////////////////////////////////////////

function addToDbHandler(req,res){

let {title,author,image,description}=req.body;
let sql=`INSERT INTO newwtable ( title,author,image,description ) VALUES ( $1,$2,$3,$4) ;`;
let safeValues=[ title,author,image,description] ;

client.query(sql,safeValues).then(()=>{

res.redirect('/selectData');

})

}

///////////////////////////////////////////////////////////


function selectDataHandler(req,res){

let sql=`SELECT * FROM newwtable ;`;


client.query(sql).then(result=>{

    res.render('pages/favorite',{data: result.rows});
    
    })


}

/////////////////////////////////////////////////////////////

function detailsHandler(req,res){

let param=req.params.new_id;
let sql=`SELECT * FROM newwtable WHERE id=$1 ;`;
 let safeValues=[param] ;

 client.query(sql,safeValues).then(result=>{

    res.render('pages/details',{data: result.rows[0]});
    
    })

}

////////////////////////////////////////////////////////////

function updateHandler(req,res){

    let {title,author,image,description}=req.body;
    
    let param=req.params.update_id;
    let sql=` UPDATE newwtable SET title=$1,author=$2,image=$3,description=$4 WHERE id=$5 ;`;

    let safeValues=[ title,author,image,description,param] ;

    client.query(sql,safeValues).then(()=>{

        res.redirect(`/details/${param}`);
        
        })


}

//////////////////////////////////////////////////////

function deleteHandler(req,res){

    
    let param=req.params.delete_id;
    let sql=`DELETE FROM newwtable WHERE id=$1 ;`;

    let safeValues=[param] ;

    client.query(sql,safeValues).then(()=>{

        res.redirect('/selectData');
        
        })

}






















































// ////////////////
// // error handler 
// function errorHandler(err,req,res){
//     res.status(500).send(err);
// }

// function notFoundHandler(req,res){

// res.status(404).send('page not found ');


// 