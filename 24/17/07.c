#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <math.h>
#include <sys/time.h>

typedef uint8_t u8;
typedef uint64_t u64;

typedef enum
{
  ADV = 0,
  BXL = 1,
  BST = 2,
  JNZ = 3,
  BXC = 4,
  OUT = 5,
  BDV = 6,
  CDV = 7,
} opcode_t;

typedef struct
{
  u64 a;
  u64 b;
  u64 c;
  u64 pc;
  u8 mem[1024];
  u64 program_size;
  u8 stdout[1024];
  u64 stdout_pos;
} computer_t;

u64 computer_compound(computer_t *comp, u8 value)
{
  if (value <= 3)
    return value;
  if (value == 4)
    return comp->a;
  if (value == 5)
    return comp->b;
  if (value == 6)
    return comp->c;
  printf("Invalid compound value %d\n", value);
  return 0;
}

bool computer_step(computer_t *comp)
{
  if (comp->pc >= comp->program_size)
  {
    printf("End of program. Shutting down...\n");
    comp->pc = 0;
    return false;
  }
  u8 opcode = comp->mem[comp->pc];
  u8 operand = comp->mem[comp->pc + 1];
  switch (opcode)
  {
  case ADV:
  {
    u64 numerator = comp->a;
    u64 denominator = 1 << computer_compound(comp, operand);
    comp->a = numerator / denominator;
    // printf("ADV 0,%d: A = A(%llu) / %llu = %llu\n", operand, numerator, denominator, comp->a);
    comp->pc += 2;
    break;
  }
  case BXL:
    comp->b = comp->b ^ operand;
    // printf("BXL 1,%d: B = B ^ %d = %llu\n", operand, operand, comp->b);
    comp->pc += 2;
    break;
  case BST:
  {
    u64 resolved = computer_compound(comp, operand) % 8;
    // printf("BST 2,%d: B = (%d -> %llu) %% 8 = %llu\n", operand, operand, computer_compound(comp, operand), resolved);
    comp->b = resolved;
    comp->pc += 2;
    break;
  }
  case JNZ:
    if (comp->a != 0)
    {
      comp->pc = operand;
      // printf("JNZ 3,%d: PC = %d\n", operand, operand);
      break;
    }
    comp->pc += 2;
    break;
  case BXC:
    comp->b = comp->b ^ comp->c;
    // printf("BXC 4,%d: B = B ^ C = %llu\n", operand, comp->b);
    comp->pc += 2;
    break;
  case OUT:
    // printf("OUT 5,%d: print = %llu\n", operand, computer_compound(comp, operand) % 8);
    comp->stdout[comp->stdout_pos++] = computer_compound(comp, operand) % 8;
    comp->pc += 2;
    break;
  case BDV:
  {
    u64 numerator = comp->a;
    u64 denominator = 1 << computer_compound(comp, operand);
    // printf("BDV 6,%d: B = A(%llu) / %llu\n", operand, numerator, denominator);
    comp->b = numerator / denominator;
    comp->pc += 2;
    break;
  }
  case CDV:
  {
    u64 numerator = comp->a;
    u64 denominator = 1 << computer_compound(comp, operand);
    u64 result = numerator / denominator;
    // printf("CDV 7,%d: C = A(%llu) / %llu = %llu\n", operand, numerator, denominator, result);
    comp->c = result;
    comp->pc += 2;
    break;
  }
  default:
    printf("Invalid opcode %d\n", opcode);
    return false;
  }
  return true;
}

typedef struct
{
  void **data;
  u64 size;
  u64 capacity;
} queue_t;

void queue_init(queue_t *queue, u64 n)
{
  queue->data = malloc(n * sizeof(void *));
  queue->size = 0;
  queue->capacity = n;
}

int queue_push(queue_t *queue, void *data)
{
  if (queue->size >= queue->capacity)
  {
    return -1;
  }
  queue->data[queue->size++] = data;
  return 0;
}

void *queue_pop(queue_t *queue)
{
  if (queue->size == 0)
  {
    return NULL;
  }
  return queue->data[--queue->size];
}

void queue_free(queue_t *queue)
{
  free(queue->data);
}

typedef struct
{
  u8 pos[8];
  u8 size;
} candidates_t;

candidates_t reverse(queue_t *qa, u8 expected)
{
  candidates_t candidates = {
      .size = 0,
  };

  while (qa->size)
  {
    u64 ai = (u64)queue_pop(qa);
    printf("reverse %llu %d\n", ai, expected);
    for (u8 i = 0; i < 8; i++)
    {
      u64 a = ai | i;
      u64 b = a % 8;
      b = b ^ 1;
      u64 c = a / (1 << b);
      b = b ^ 5;
      b = b ^ c;
      u64 out = b % 8;
      if (out == expected)
      {
        printf("found %llu\n", a);
        candidates.pos[candidates.size++] = a << 3;
      }
    }
  }

  for (u8 i = 0; i < candidates.size; i++)
  {
    queue_push(qa, (void *)candidates.pos[i]);
  }

  return candidates;
}
void crack(int code[], int length)
{
  printf("crack\n");
  queue_t queue;
  queue_init(&queue, 1024);
  queue_push(&queue, (void *)0);
  // u64 aCandidates[1024] = {0};
  // volatile u64 aSize = 1;
  for (int i = length - 1; i >= 0; i--)
  {
    reverse(&queue, code[i]);
  }
  queue_free(&queue);
}

void benchmark(const char *label, size_t n, void (*func)())
{
  struct timeval start, end;
  gettimeofday(&start, NULL);

  for (size_t i = 0; i < n; i++)
    func();

  gettimeofday(&end, NULL);
  double elapsed = (end.tv_sec - start.tv_sec) * 1e6;
  elapsed = (elapsed + (end.tv_usec - start.tv_usec));
  elapsed /= n;
  printf("[%s] Elapsed time: %.3f microseconds\n", label, elapsed);
}

void run_computer()
{
  computer_t computer = {
      .a = 17323786,
      .b = 0,
      .c = 0,
      .pc = 0,
      .mem = {2, 4, 1, 1, 7, 5, 1, 5, 4, 1, 5, 5, 0, 3, 3, 0},
      .program_size = 16,
  };

  while (computer_step(&computer))
    ;

  // Print stdout
  for (u64 i = 0; i < computer.stdout_pos; i++)
  {
    printf("%d", computer.stdout[i]);
  }
  printf("\n");

  int code[] = {7, 4, 2, 5, 1,
                4, 6, 0, 4};
  crack(code, sizeof(code) / sizeof(code[0]));
}

#define BENCH(func) \
  benchmark(#func, 1, func);

#define BENCHN(func, N) \
  benchmark(#func, N, func);

int main()
{
  BENCHN(run_computer, 1);
  return 0;
}