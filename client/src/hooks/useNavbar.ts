import { useState, useEffect } from "react";
import axios from "axios";

export function useNavbar() {
  const [username, setUsername] = useState("");
  const [coins, setCoins] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [memberSince, setMemberSince] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    axios
      .get(`http://localhost:8000/auth/profile/${storedUsername}`)
      .then((res) => {
        setUsername(res.data.username);
        setCoins(res.data.coins);
        setTotalPlayed(res.data.totalPlayed);

        if (res.data._id) {
          const timestamp = parseInt(res.data._id.substring(0, 8), 16) * 1000;
          const date = new Date(timestamp);
          const formattedDate = date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          setMemberSince(formattedDate);
        }
      });
  }, []);

  return { username, coins, totalPlayed, memberSince };
}
