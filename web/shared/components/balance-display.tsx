interface BalanceDisplayProps {
  balance: number;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
    <p className="text-3xl font-bold text-white text-center">
      <span className="text-yellow-400">₱</span>{" "}
      {balance.toLocaleString("en-US", { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </p>
  );
}



