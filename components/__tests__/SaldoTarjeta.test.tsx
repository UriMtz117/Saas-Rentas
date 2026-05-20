import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SaldoTarjeta from "@/components/SaldoTarjeta";

describe("SaldoTarjeta", () => {
  it("renderiza el monto con signo de pesos", () => {
    render(<SaldoTarjeta nombre="Carlos" saldoActual={2300} />);

    expect(screen.getByText(/\$2,300/)).toBeInTheDocument();
  });
});
