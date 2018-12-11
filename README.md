# aikido-platformer
Simple platformer game using merged animations for martial arts techniques.

copyright 2018 Jerry Kalkhof

This project is based off the html5 game engine melonjs.
From the original melonjs platformer tutorial found here:
https://github.com/melonjs/tutorial-platformer

## version 1.0
This version is very basic and only has basic movement of the main character.
Simple attack animations from enemy character.

## This project was built using the following tools:
- atom - text editor
-- https://atom.io/
- tiled - tilemap editor
-- https://www.mapeditor.org/
- graphics gale - sprite animation editor
-- https://graphicsgale.com/us/
- texture packer - spritesheet texture packer tool
-- https://www.codeandweb.com/texturepacker

## Run Instructions for Windows
1. install ubuntu - microsoft windows subsystem
	https://www.microsoft.com/en-us/p/ubuntu/9nblggh4msv6#activetab=pivot:overviewtab
2. use nodejs to install http server
	mkdir node_modules
	sudo npm install http-server -g
3. run http server		
	export PATH=./node_modules/.bin:$PATH
	echo $PATH
	http-server -a localhost -p 8000 -c-1
4. run app from localhost
	http://localhost:8000/
  http://localhost:8000/tutorial_step5/index.html
