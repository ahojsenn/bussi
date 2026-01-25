DEVURL=https://bussidev.docjoe.lug-stormarn.de

dev:
	qrencode -t UTF8  "${DEVURL}"\
	&& yarn dev -host --no-qr 

make devserver:
	killall node\
	&& (yarn dev --host --no-qr > del.me.log 2>&1 &)