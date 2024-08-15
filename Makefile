all:
	nvm use node && \
	npx antora --fetch antora-playbook.yml
