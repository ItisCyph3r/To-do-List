const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const lodash = require('lodash');
const app = express();
const port = 2022;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'))
app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://todolist:todolist@todolist.rh2p8.mongodb.net/todoDB');


const todoSchema = new mongoose.Schema({
    item_name : {
        type: String,
        required: true
    }, 
});

const homelist = mongoose.model('Home_list', todoSchema)

;

const a = new homelist({
    item_name: 'Welcome to your todolist!'
})
const b = new homelist({
    item_name: 'Hit the + button to add a new item'
})
const c = new homelist({
    item_name: '<-- Hit to delete an item'
})

const defaultitems = [a, b, c]

const customSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    }, 
    item_name: [todoSchema]
});
const Customlist = mongoose.model('Customlist', customSchema);

app.get('/', (req, res)=>{


    homelist.find({}, (err, found) => {
        if(found.length === 0){
            homelist.insertMany([a, b, c], (err) => {
                if(err)
                    return console.log(err)
                else{
                    console.log('Successful')
                    res.redirect('/')
                }
            })
        }
        else
            res.render('index', {
                listTitle: 'Today',
                itemList: found
            }); 
    })

    
})

app.post('/', (req, res)=>{

    let newitem = req.body.addItem 
    const listName = req.body.list
    const newish = new homelist({
            item_name: newitem
        })
    if (listName === 'Today'){
        newish.save()
        res.redirect('/')
    } else{
        homelist.findOne({name: listName}, (err, foundlist) => {
            if(err){
                console.log(err)
            } else{
                Customlist.findOne({name: listName}, (err, docs) => {
                    if(err)
                        return console.log(err)
                    else{
                        docs.item_name.push(newish)
                        docs.save()
                        res.redirect('/' + listName)
                    }
                })
            }
        })
    }
    
})


app.post('/delete', (req, res) => {
    const checked = req.body.checkbox.toString().trim()
    const listName = req.body.listName
    console.log(listName)
    console.log(checked)
    if (listName === 'Today'){
        homelist.findByIdAndRemove(checked, (err) => {
            if(err)
                return console.log(err)
            else{
                console.log('Successful')
                res.redirect('/')
            } 
        })
    } else  {
        Customlist.findOneAndUpdate(
            {name: listName},
            {$pull: {item_name: {_id: checked}}},
            (err) => {
                if(err)
                    return console.log(err)
                else{
                    console.log('Successful')
                    res.redirect('/' + listName)
                }
            }
        )
    }
})

app.get('/:postid', (req, res) => {
    if (req.params.name != "favicon.ico") {
        const postid = lodash.capitalize(req.params.postid)
        

        Customlist.findOne({name: postid}, (err, results) => {
            if(results){
                res.render('list', {
                    'listTitle': results.name,
                    'itemList': results.item_name
                })
            }
            else{
                const custList = new Customlist({
                    name: postid,
                    item_name: defaultitems
                })
                custList.save((err) => {
                    if(err){
                        return console.log(err)
                    }
                    else{
                        console.log('Successful')
                    }
                })
                res.redirect('/' + postid)
            }
        })
    }
    
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});



