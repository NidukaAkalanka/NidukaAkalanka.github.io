read -p "Create a user?[N/y]" -n 1 -r

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  read -p "Enter username (characters): " ssh_user
  until [[ "$ssh_user" =~ ^[0-9a-zA-Z]{2,8}$ ]]; do
    read -p $'\e[31mPlease enter a valid username\e[0m: ' ssh_user
  done

  useradd -M "$ssh_user" -s /bin/false && echo "$ssh_user user has successfully created."
  set +e
  until passwd $ssh_user; do
    echo "Try again"
    sleep 1
  done
  read -p "Max logins limit: " maxlogins
  echo "$ssh_user  hard  maxlogins ${maxlogins}" >/etc/security/limits.d/"$ssh_user".conf
fi


echo "GET / HTTP/1.1[crlf]Host: [host][crlf]Connection: upgrade [crlf] Upgrade: websocket[crlf][crlf]"

read -rp "Press <Enter> to restart the server"
reboot
