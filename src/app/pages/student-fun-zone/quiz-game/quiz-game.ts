import { Component } from '@angular/core';

@Component({
  selector: 'app-quiz-game',
  standalone: true,
  imports: [],
  templateUrl: './quiz-game.html',
  styleUrls: ['./quiz-game.css']
})
export class QuizGameComponent {

  resultText = '';

  checkAnswers(): void {
    let score = 0;
    const total = 5;

    const answers: Record<string, string[]> = {
      q1: ['a'],
      q2: ['a', 'b', 'c'],
      q3: ['b'],
      q4: ['a', 'b', 'd'],
      q5: ['b']
    };

    for (let i = 1; i <= total; i++) {
      const inputs = document.querySelectorAll<HTMLInputElement>(`input[name="q${i}"]`);
      const selected = Array.from(inputs)
        .filter(input => input.checked)
        .map(input => input.value);

      const correct = answers[`q${i}`];
      if (selected.length === correct.length &&
          selected.every(val => correct.includes(val))) {
        score++;
      }
    }

    this.resultText = `Osvojili ste ${score} od ${total} poena!`;
  }
}
