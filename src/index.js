#!/usr/bin/env node
import cli from 'commander';
import fs from 'fs';
import index from './feature/index.js';
import connector from './feature/connector.js';
import API from './library/api.js'

cli.description('Apply definition file');
cli.name('apictl');
cli.usage('<command>');
cli.addHelpCommand(false);
cli.helpOption(false);

cli
  .command('apply')
  .argument('file', 'file or directory with the json configuration')
  .action(async function(file) {
    const path = `${process.cwd()}/${file}`;
    let files = [];
    if(fs.lstatSync(path).isDirectory()){
      const dirFiles = fs.readdirSync(path);

      if(dirFiles.length > 0){
        dirFiles.map(async (file) => {
          if(file.includes('.json')){
            files.push(`${path}${file}`);
          }
        });
      }
    }
    
    if(fs.lstatSync(path).isFile() && path.includes('.json')){
      files.push(`${path}`);
    }

    if(files.length < 1){
      console.log('No json files found.');
    }

    let data = {};
    files.map(async (file) => {
      console.log(`Loading file "${file}"...`);
      const buffer = fs.readFileSync(file);
      try{
        data = JSON.parse(buffer.toString());
      }catch(e){
        throw Error(`Invalid file "${file}"`)
      }

      const { spaceId, indexes, connectors } = data; 

      try{
        await API.action.find({spaceId, feature: 'space'});
      }catch(e){
        throw Error(e.response.data.message);
      }

      connector({ spaceId, connectors });
      index({ spaceId, indexes });   
    });
    
  });
  
cli.parse(process.argv);
