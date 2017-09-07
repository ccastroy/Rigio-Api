FROM node

COPY . /opt/rigio
WORKDIR /opt/rigio

EXPOSE 3000


RUN npm install 


CMD node .




