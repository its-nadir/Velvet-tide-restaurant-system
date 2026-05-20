import React from "react";
import { useParams, Link } from "react-router-dom";
import dishes from "../data/dishes";

export default function DishDetail() {
  const { id } = useParams();
  const dish = dishes.find((d) => d.id === Number(id));

  if (!dish) return <h2 style={{ textAlign: "center" }}>Dish not found</h2>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f8f8f8", minHeight: "100vh" }}>
      <header
        style={{
          backgroundColor: "#222",
          color: "white",
          padding: "25px 0",
          textAlign: "center",
          fontSize: "2em",
        }}
      >
        {dish.name}
      </header>

      <main style={{ textAlign: "center", padding: "40px" }}>
        <img
          src={dish.fullImage}
          alt={dish.name}
          style={{ width: "60%", borderRadius: "10px", marginBottom: "20px" }}
        />
        <p style={{ fontSize: "18px" }}>{dish.description}</p>
        <p style={{ fontWeight: "bold", fontSize: "20px" }}>{dish.price}</p>

        <Link
          to="/"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#222",
            color: "white",
            borderRadius: "5px",
            textDecoration: "none",
          }}
        >
          ← Back to Menu
        </Link>
      </main>
    </div>
  );
}
