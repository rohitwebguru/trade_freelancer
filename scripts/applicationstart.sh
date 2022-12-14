#!/bin/bash

#give permission for everything in the trade_marketplace directory
sudo chmod -R 777 /home/ubuntu/trade_marketplace

#navigate into our working directory where we have all our github files
cd /home/ubuntu/trade_marketplace

#add npm and node to path
export NVM_DIR="$HOME/.nvm"	
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # loads nvm	
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # loads nvm bash_completion (node is in path now)

#install node modules
npm install

#start our node app in the background
# node index.js > app.out.log 2> app.err.log < /dev/null & 

pm2 start index.js