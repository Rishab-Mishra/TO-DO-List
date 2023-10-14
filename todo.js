const express = require("express");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");


app.set('view engine' , 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));

mongoose.connect("mongodb+srv://Rishab-Mishra:Itsbucky2007@cluster0.zfavwbh.mongodb.net/todo");

const itemsSchema = {
    name: String
};

const Items = mongoose.model("Item" , itemsSchema);



const listSchema = {
    name : String,
    items: [itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/", function(req , res){

    
    Items.find().then(function(foundItems){
     if(foundItems.length === 0){
        
       res.render("list.ejs",{listTitle: "Today"});
      } 
     else{
        res.render("list.ejs" , {listTitle : "Today" , newListItems : foundItems});
     }  
    }).catch(function(err){
        console.log(err);
    });
    
});

app.get("/:customPath" , function(req , res){
    const customPath = _.capitalize(req.params.customPath);
    if(customPath !== "Favicon.ico"){
    List.findOne({name: customPath}).then(function(foundList){
        if(!foundList){
            const list = new List({
                name: customPath,
                
            });
            list.save();
            res.redirect("/" + customPath);
        }else{
            res.render("list.ejs", {listTitle: foundList.name , newListItems : foundList.items});
        }
    }).catch(function(err){
        console.log(err);
    });
}else{
    res.redirect("/");
}
});


app.post("/" , function(req , res){
 const newItem = req.body.todo;
 const listName = req.body.list;
 const item = new Items({
    name: newItem
    });

if(listName === "Today"){
    
    item.save();
    res.redirect("/");
}else{
    List.findOne({name: listName}).then(function(foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
    }).catch(function(err){
        console.log(err);
    });
}

 

});

app.post("/delete", function(req , res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.list;

    if(listName === "Today"){
        Items.findByIdAndRemove(checkedItemId).then(()=>{});
        res.redirect("/");
        
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then((foundList)=>{
            res.redirect("/"+ listName);
        });
    }

    
});


let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
app.listen(port,()=>{console.log(`Server has started successfully.`)});
