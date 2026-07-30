import { Skeleton } from "@workspace/ui";

export default function HomepageLoading() {
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero skeleton */}
      <div
        style={{
          background: "#0c1929",
          padding: "6rem 1rem",
          textAlign: "center",
        }}
      >
        <Skeleton
          style={{
            height: "3rem",
            width: "70%",
            maxWidth: "40rem",
            margin: "0 auto 1rem",
          }}
        />
        <Skeleton
          style={{
            height: "1.25rem",
            width: "50%",
            maxWidth: "30rem",
            margin: "0 auto 1.5rem",
          }}
        />
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Skeleton
            style={{ height: "3rem", width: "10rem", borderRadius: "999px" }}
          />
          <Skeleton
            style={{ height: "3rem", width: "10rem", borderRadius: "999px" }}
          />
        </div>
      </div>

      {/* Courses section skeleton */}
      <div
        style={{ padding: "4rem 1rem", maxWidth: "80rem", margin: "0 auto" }}
      >
        <Skeleton
          style={{ height: "2rem", width: "16rem", margin: "0 auto 0.5rem" }}
        />
        <Skeleton
          style={{ height: "1rem", width: "20rem", margin: "0 auto 2rem" }}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))",
            gap: "1.5rem",
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton
                style={{ aspectRatio: "16/9", borderRadius: "0.75rem" }}
              />
              <Skeleton
                style={{ height: "1.5rem", width: "80%", marginTop: "0.75rem" }}
              />
              <Skeleton
                style={{ height: "1rem", width: "40%", marginTop: "0.5rem" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
