const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Dinosaure = mongoose.model('Dinosaure');
const passwordHash = require("password-hash");

router.get('/', (req, res) => {
    res.render("dinosaure/signup", {
        viewTitle: "Inscrire Dinosaure"
    });
});


//block

router.post('/signup', (req, res) => {
    if (req.body._id == '')
        insertRecord(req, res);
        else
        updateRecord(req, res);
});

router.get('/modifier/:id', (req, res) => {
    Dinosaure.findById(req.params.id,function (err, dino) {
        if (!err) {
            res.render("dinosaure/modifier", {
                viewTitle: "Modification Dinosaure",
                dinosaure:dino
            });
            
            
        }
    })
    
});


function insertRecord(req, res) {
    var dinosaure = new Dinosaure();
    dinosaure.login = req.body.login;
    dinosaure.password = passwordHash.generate(req.body.password);
    dinosaure.age = req.body.age;
    dinosaure.race = req.body.race;
    dinosaure.famille = req.body.famille;
    dinosaure.nourriture = req.body.nourriture;

    dinosaure.save((err, doc) => {
        if (!err)
        res.redirect("../dinosaure/list/"+dinosaure._id);
            
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("dinosaure/signup", {
                    viewTitle: "Insert dinosaure",
                    dinosaure: req.body
                });
            }
            else
                console.log('Error during record insertion : ' + err);
        }
    });
}

function updateRecord(req, res) {
    Dinosaure.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, doc) => {
        if (!err) { res.redirect('../dinosaure/list/'+req.body._id); }
        else {
            if (err.name == 'ValidationError') {
                handleValidationError(err, req.body);
                res.render("dinosaure/signup", {
                    viewTitle: 'Update Dinosaure',
                    dinosaure: req.body
                });
            }
            else
                console.log('Error during record update : ' + err);
        }
    });
}


router.get('/list/:dinoId', (req, res) => {
    Dinosaure.find((err, docs) => {
        if (!err) {
            Dinosaure.findById(req.params.dinoId,function (err, dino) {
                if (!err) {
                    var list=[];
                    list=list.concat(dino.amis);
                    var listDocs=docs.filter(doc=>list.indexOf(doc.login)<0)
                    
                    res.render("dinosaure/list", {
                        list: listDocs,
                        dinoID:req.params.dinoId
                    });
                    
                    
                }
            })
            
        }
        else {
            console.log('Error in retrieving employee list :' + err);
        }
    });
});

router.get('/listAmi/:dinoId', (req, res) => {
    Dinosaure.find((err, docs) => {
        if (!err) {
            Dinosaure.findById(req.params.dinoId,function (err, dino) {
                if (!err) {
                    var list=[];
                    list=list.concat(dino.amis);
                    var listDocs=docs.filter(doc=>list.indexOf(doc.login)>=0)
                    var a=req.params.dinoId;
                    console.log(a);
                    res.render("dinosaure/listAmi", {
                        list: listDocs,
                        dinoID:a
                    });
                    
                    
                }
            })
            
        }
        else {
            console.log('Error in retrieving employee list :' + err);
        }
    });
});

router.post('/connect', (req, res) => {
    
        if (!req.body.login || !req.body.password) {
            //Le cas où l'email ou bien le password ne serait pas soumit ou nul
            res.status(400).json({
                "text": "Requête invalide"
            })
        } else {
            Dinosaure.findOne({
                login: req.body.login
            }, function (err, dino) {
                //a noter que user est un element du doc personne ici
                if (err) {
                    res.status(500).json({
                        "text": "Erreur interne"
                    })
                } else if (!dino) {
                    res.status(401).json({
                        "text": "Le dinosaure n'existe pas ressayer le login"
                    })
                } else {
                    if (dino.authenticate(req.body.password)) {
                       // localStorage.setItem('token', dino.getToken());
                        res.redirect('../dinosaure/list/'+dino._id);
                    } else {
                        res.status(401).json({
                            "text": "Mot de passe incorrect"
                        })
                    }
                }
            })
        }
});


function handleValidationError(err, body) {
    for (field in err.errors) {
        switch (err.errors[field].path) {
            case 'fullName':
                body['fullNameError'] = err.errors[field].message;
                break;
            case 'email':
                body['emailError'] = err.errors[field].message;
                break;
            default:
                break;
        }
    }
}

router.get('/addAmi/:dinoId/:login', (req, res) => {
    Dinosaure.findById(req.params.dinoId, (err, doc) => {
        if (!err) {
            var list=[];
            list=list.concat(doc.amis);
            list=list.concat(req.params.login);
            var myquery = { _id: doc._id };
            var newvalues = { $set: {"amis": list} };
             Dinosaure.updateOne(myquery, newvalues, function(err, resultat) {
             if (err) throw err;
             //console.log("1 document updated");
             res.redirect("../../../dinosaure/list/"+req.params.dinoId);
            });
            
            
        }
    });
});

router.get('/delete/:dinoId/:login', (req, res) => {
    Dinosaure.findById(req.params.dinoId, (err, doc) => {
        if (!err) {
            var list=[];
            list=doc.amis.filter(elt=>elt!==req.params.login);
            var myquery = { _id: doc._id };
            var newvalues = { $set: {"amis": list} };
             Dinosaure.updateOne(myquery, newvalues, function(err, resultat) {
             if (err) throw err;
             console.log("1 document updated");
             res.redirect("../../../dinosaure/listAmi/"+req.params.dinoId);
            });
        }
        else { console.log('Error in employee delete :' + err); }
    });
});

module.exports = router;