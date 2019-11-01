const mongoose = require('mongoose');
const passwordHash = require('password-hash');
const jwt = require('jwt-simple');

var dinosaureSchema = new mongoose.Schema({
    login: {
        type: String,
        required: 'This field is required.',
        unique:true
    },
    password: {
        type: String
    },
    age: {
        type: String
    },
    famille: {
        type: String
    },
    race: {
        type: String
    },
    nourriture: {
        type: String
    },
    amis:{
        type:Array
    }
    

});

dinosaureSchema.methods = {
	authenticate: function (password) {
		return passwordHash.verify(password, this.password);
	},
	getToken: function () {
		return jwt.encode(this, config.secret);
	}
}


mongoose.model('Dinosaure', dinosaureSchema);