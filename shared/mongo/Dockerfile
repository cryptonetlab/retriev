FROM mongo:bionic

EXPOSE 27107

COPY run.sh /run.sh

RUN chmod +x run.sh

ENTRYPOINT ["/run.sh"]
