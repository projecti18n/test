cd /tmp
git clone https://github.com/projecti18n/test.git
rm -r /var/www/*
mv -v /tmp/test/* /var/www/
rm -r /tmp/*
cd /var/www/
pkill -f node
npm install express
node index.js