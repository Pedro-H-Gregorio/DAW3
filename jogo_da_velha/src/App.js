import { useEffect, useState } from "react";

function Quadrado({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

async function fazerRequest(prompt) {
  const url = "http://localhost:11434/api/generate";

  const body = {
    model: "codellama",
    prompt: prompt,
    stream: false,
    options: {
      temperature: 0.3,
      top_k: 10,
      top_p: 0.8,
    },
    format: {
      type: "object",
      properties: {
        position: {
          type: "integer",
          minimum: 0,
          maximum: 8,
        },
      },
      required: ["position"],
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Erro: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao fazer a requisição:", error);
  }
}

export function Jogo() {
  let [tabuleiro, setTabuleiro] = useState(new Array(9).fill(null));
  let [vezX, setVezX] = useState(true);
  let [status, setStatus] = useState("");

  useEffect(() => {
    const winner = calculateWinner(tabuleiro);
    if (winner) {
      setStatus("Ganhador: " + (vezX ? "X" : "O"));
    } else {
      setStatus("Próximo Jogador: " + (vezX ? "X" : "O"));
    }
  }, [vezX]);

  useEffect(() => {
    if (vezX === false) {
      const data = async () => {
        try {
          const response = fazerRequest(
            `Você é um jogador de jogo da velha (O) e precisa jogar de forma estratégica para impedir que o adversário (X) vença. Receberá um array de 9 posições representando o tabuleiro, onde cada posição pode ser 'X', 'O' ou null.\n\n### Instruções:\n1. Sua tarefa é fazer uma jogada como 'O'.\n2. Sempre priorize bloquear a vitória do adversário ('X').\n3. Se não houver risco imediato, escolha a melhor posição livre.\n4. Retorne apenas a posição (índice) do array em que você irá jogar.\n\n### Exemplo de entrada:\n[null, 'X', null, null, 'O', null, null, null, 'X']\n\n### Exemplo de saída:\n{\"position\": 2}\n\n### Tabuleiro atual:\n
          [${tabuleiro.map((el) => {
            if (!el) {
              return "null";
            } else {
              return el;
            }
          })}]`
          );
          let result = await response;
          result = JSON.parse(result.response);
          console.log(result);

          let jogada = [...tabuleiro];

          jogada[result.position] = "O";
          console.log(jogada);
          setTabuleiro(jogada);
          setVezX(true);
        } catch (error) {
          console.error("Erro ao buscar os dados:", error);
        }
      };
      data();
    }
  }, [vezX]);

  return (
    <>
      <div>
        <h1>{status}</h1>
      </div>
      <div className="game-board">
        <Tabuleiro
          tabuleiro={tabuleiro}
          setTabuleiro={setTabuleiro}
          vezX={vezX}
          setVezX={setVezX}
          setStatus={setStatus}
        />
      </div>
    </>
  );
}

function Tabuleiro({ tabuleiro, setTabuleiro, vezX, setVezX }) {
  const clicarQuadrado = (number) => {
    let jogada = [...tabuleiro];
    if (vezX) {
      jogada[number] = "X";
      setTabuleiro(jogada);
      setVezX(false);
    }
  };

  return (
    <>
      <div className="board-row">
        <Quadrado
          value={tabuleiro[0]}
          onSquareClick={() => clicarQuadrado(0)}
        />
        <Quadrado
          value={tabuleiro[1]}
          onSquareClick={() => clicarQuadrado(1)}
        />
        <Quadrado
          value={tabuleiro[2]}
          onSquareClick={() => clicarQuadrado(2)}
        />
      </div>
      <div className="board-row">
        <Quadrado
          value={tabuleiro[3]}
          onSquareClick={() => clicarQuadrado(3)}
        />
        <Quadrado
          value={tabuleiro[4]}
          onSquareClick={() => clicarQuadrado(4)}
        />
        <Quadrado
          value={tabuleiro[5]}
          onSquareClick={() => clicarQuadrado(5)}
        />
      </div>
      <div className="board-row">
        <Quadrado
          value={tabuleiro[6]}
          onSquareClick={() => clicarQuadrado(6)}
        />
        <Quadrado
          value={tabuleiro[7]}
          onSquareClick={() => clicarQuadrado(7)}
        />
        <Quadrado
          value={tabuleiro[8]}
          onSquareClick={() => clicarQuadrado(8)}
        />
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
