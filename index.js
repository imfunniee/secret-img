#! /usr/bin/env node --harmony
 
var program = require('commander');

var Jimp = require('jimp');
const fs = require('fs');
const { encrypt, decrypt, generateKey  } = require('nacl-encrypt');
var base64Img = require('base64-img');
const readline = require('readline');
var async = require('async');
var chalk = require('chalk');
var error = chalk.bold.rgb(0, 0, 0).bgRgb(255, 60, 60);
var done = chalk.bold.rgb(0, 0, 0).bgRgb(141, 255, 104);
var fullpath = __dirname;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

program
    .version('1.0.2', '-v, --version')
    .option('-e, --encrypt', 'encrypt image')
    .option('-d, --decrypt', 'decrypt image');
 
program.parse(process.argv);

if(program.encrypt){
    rl.question('Image Path (path/to/img) or URL (https://imgur.com/img) : ', function (args) {
        if(!args){
            console.log(error("\npath can't be empty"));
            rl.close();
        }else{
            Jimp.read(args)
              .then(image => {
                image.getBase64Async(Jimp.AUTO).then(image => {
                const secret = generateKey();
                console.log(done("\nYour secret image key (copy this) : " + secret));
                    var encryptedMessage = encrypt(image.toString(), secret);
                   fs.writeFile(fullpath+"/secret-img.txt",encryptedMessage, function(err) {
                    if(err) {
                        return console.log(error("\nAn error occurred"));
                    }
                    console.log(done(`\nsecret-img.txt saved (${fullpath}\\secret-img.txt)`));
                    console.log("\nsend this to your friend or whosoever you want with your secret image key & tell them to decrypt it :)");
                }); 
                }).catch(err => {
                  console.log(error("\nAn error occurred"));
                  rl.close();
                });
              })
              .catch(err => {
                console.log(error("\nAn error occurred"));
                rl.close();
            });
            rl.close();
        }
      });
}else if(program.decrypt){
    var data = [];
    async.series([
        function (callback) {
            rl.question('path to your secret-img.txt (path/to/secret-img.txt) : ', function (args) {
                if(!args){
                    console.log(error("path can't be empty"));
                    rl.close();
                }
                data.push(args);
                callback();
            });
        }, function (callback) {
            rl.question('Enter secret key : ', function (args) {
                if(!args){
                    console.log(error("\nsecret key can't be empty"));
                    rl.close();
                }
                data.push(args);
                callback();
            });
        },
    ], function () {
        fs.readFile(data[0], "utf8", function read(err, secret_img) {
            if (err) {
                console.log(error("\nAn error occurred"));
            }
        const decryptedMessage = decrypt(secret_img,data[1]);
        base64Img.img(decryptedMessage, '', fullpath +'/super-secret-img', function(err, filepath) {
            if(err) {
                console.log(error("\nAn error occurred"));
                return;
            }
            console.log(done("\nYour super secret image is here : " + filepath));
        });
        });
        rl.close();
    });
}else{
    console.log(error("\nUse -h for help"));
    process.exit(1);
}