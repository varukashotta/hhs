module.exports.eat_breakfast = function()
{
        console.log('Eating breakfast...');
        Kitchen.eat();
        console.log('done.');
}

require('make-runnable');