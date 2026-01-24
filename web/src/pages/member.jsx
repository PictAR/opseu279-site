// web/src/pages/member.jsx

export default function Member() {
  return (
    <section style={wrapStyle}>
      <h1 style={titleStyle}>Welcome Local 279 Members!</h1>
    </section>
  );
}

const wrapStyle = {
  minHeight: "60vh",
  display: "grid",
  placeItems: "center",
  textAlign: "center",
};

const titleStyle = {
  margin: 0,
  fontSize: 26,
  fontWeight: 950,
  color: "#0055b8",
};
