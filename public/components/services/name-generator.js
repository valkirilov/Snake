'use strict';

angular.module('myApp.services.name-generator', [])
.service('nameGenerator', function () {
  var objects = ['Lion', 'Beef', 'Bed', 'Cow' ,'Bananas', 'Hamster', 'Rhino', 'Knife', 'Tiger', 
                   'Phone', 'Dog', 'Bottle', 'Squirrel', 'Crow', 'Apple', 'Sheep', 'Panda', 
                   'Zebra', 'Lamp', 'Giraffe', 'Chicken'];
    
    var adjectives = ['impossible', 'inexpensive', 'innocent', 'inquisitive', 'modern', 'mushy', 'odd', 
                      'open', 'outstanding', 'poor', 'powerful', 'prickly', 'puzzled', 'real', 'rich', 
                      'shy', 'sleepy', 'stupid', 'super', 'talented', 'tame', 'tender', 'tough', 
                      'uninterested', 'vast', 'wandering', 'wild', 'wrong'];
    
    var getRandom = function (max) {
        return Math.floor(Math.random() * max);
    };
    
    var getName = function() {
        var name = adjectives[getRandom(adjectives.length)] + ' ' + objects[getRandom(objects.length)];
        return name;
    };
    
    this.getName = getName;
});