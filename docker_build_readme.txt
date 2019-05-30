
# To build without using any cache
docker build --no-cache -t chatterbox .

# To run and publish on port 5000
docker run -d -p 5000:5000 --name chatterbox chatterbox

# To use the shell the application is running in
docker exec -it chatterbox  bash