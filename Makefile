ALL: images/dtn-deployment.png

%.png: %.mmd
	mmdc -i $< -o $@

%.svg: %.mmd
	mmdc -i $< -o $@
