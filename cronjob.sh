cd /tmp
git clone https://github.com/projecti18n/test.git
mv -v /tmp/test/* /var/www/
rm -r /tmp/*
cd /var/www/
pkill -f node
npm install express formidable neo4j-driver --save
npm init -y
node server.js

