import Button from "@/components/Button";

const HomeButton = ({ className = "" }) => {
  return (
    // Añadimos z-10 para asegurar que el botón esté por encima de cualquier degradado o borde del Header
    <div className={`absolute top-4 right-4 z-10 ${className}`}>
      <Button
        variant="secondary"
        onClick={() => window.location.assign("/")}
      >
        Home
      </Button>
    </div>
  );
};

export default HomeButton