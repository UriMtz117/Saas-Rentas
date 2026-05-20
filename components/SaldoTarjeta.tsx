type SaldoTarjetaProps = {
  nombre: string;
  saldoActual: number;
};

export default function SaldoTarjeta({ nombre, saldoActual }: SaldoTarjetaProps) {
  return (
    <div>
      <h3>{nombre}</h3>
      <p>{saldoActual.toLocaleString()}</p>
    </div>
  );
}
