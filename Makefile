DEVURL="https://bussidev.docjoe.lug-stormarn.de"

dev:
	qrencode -t UTF8  "${DEVURL}"\
	&& yarn dev -host --no-qr 