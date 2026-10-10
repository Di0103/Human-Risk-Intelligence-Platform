function Navbar() {
  return (
    <header
      style={{
        background: "#2563eb",
        color: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2>Human Risk Management System</h2>

      <div>
        <span>Welcome, Admin</span>
      </div>
    </header>
  );
}

export default Navbar;