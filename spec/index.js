var test = require('tape');
var fs = require('fs');
var path = require('path');
var babel = require('babel-core');

var pluginPath = require.resolve('../index.js'); // ==> require

function normalizeFilename(filename) {
    return path.normalize(filename).replace(/\\/g, '/');
}

function processFile(sourcePath, options) {
    return babel.transformFileSync(sourcePath, {
        sourceMaps: true,
        /*optional: ['runtime'],*/
        "presets": ["stage-0"],
        plugins: [
            "transform-runtime",
            "transform-strict-mode",
           /* ()=>{
                return {
                    visitor: {

                    }
                }
            }*/
            require(pluginPath).configure(options)
        ]
    }).code;
}

function getExpected(expectedPath, sourcePath) {
    return fs.readFileSync(expectedPath, 'utf-8')
        .replace(/\{\{path\}\}/g, normalizeFilename(sourcePath))
        .replace(/\r/g, '')
        .trim();
}

var types = [
    'ArrayExpression',
   /* 'CallExpression',
    'ClassDeclaration',
    'Complex',
    'Decorator',
    'FunctionDeclaration',
    'FunctionExpression',
    'NewExpression',
    'ObjectExpression'*/
].map(function(type){
    return {
        desc: 'type: ' + type,
        fixture: type,
        options: {
            'registratorName': 'testWrapper'
        }
    };
});

var utilTests = [
/*{
    desc: 'Blackbox setter',
    fixture: 'Blackbox',
    options: {
        'registratorName': 'testWrapper',
        'blackbox': ['**!/Blackbox/!**']
    }
},*/
{
    desc: 'Use default options',
    fixture:'config/default',
    options: {}
}/*,
{
    desc: 'Use options given via configure method',
    fixture:'config/method',
    options: {
        'registratorName': 'testWrapper'
    }
}*/];

var tests = types.concat(utilTests);

tests.forEach(function(config){
    test(config.desc, function(t) {
        var expectedPath = path.join(__dirname, 'fixtures', config.fixture, 'expected.js');
        var sourcePath = path.join(__dirname,'test.js');

        var expected = getExpected(expectedPath, sourcePath);

        var actual = processFile(sourcePath, config.options);
        t.equal(expected, actual);
        t.end();
    });
});
