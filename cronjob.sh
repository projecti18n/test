cd /tmp
git clone https://github.com/projecti18n/test.git
rm -r /var/www/*
mv -v /tmp/test/* /var/www/
rm -r /tmp/*
cd /var/www/
pkill -f node
npm install express
cd
cp node_modules /var/www/node_modules -r
cd /var/www/
cp addnodes.js ~/
cp addnodestest.js ~/
cp addnodestest2.js ~/
node webserver.js