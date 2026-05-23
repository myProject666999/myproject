import type { OTOperation } from '@/types'

export class OTUtils {
  static transform(op1: OTOperation, op2: OTOperation): [OTOperation, OTOperation] {
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        return [op1, { ...op2, position: op2.position + (op1.text?.length ?? 0) }]
      }
      return [{ ...op1, position: op1.position + (op2.text?.length ?? 0) }, op2]
    }

    if (op1.type === 'insert' && op2.type === 'delete') {
      if (op1.position <= op2.position) {
        return [op1, { ...op2, position: op2.position + (op1.text?.length ?? 0) }]
      }
      if (op1.position >= op2.position + (op2.length ?? 0)) {
        return [{ ...op1, position: op1.position - (op2.length ?? 0) }, op2]
      }
      return [{ ...op1, position: op2.position }, op2]
    }

    if (op1.type === 'delete' && op2.type === 'insert') {
      if (op2.position <= op1.position) {
        return [{ ...op1, position: op1.position + (op2.text?.length ?? 0) }, op2]
      }
      if (op2.position >= op1.position + (op1.length ?? 0)) {
        return [op1, { ...op2, position: op2.position - (op1.length ?? 0) }]
      }
      return [op1, { ...op2, position: op1.position }]
    }

    if (op1.type === 'delete' && op2.type === 'delete') {
      const op1Start = op1.position
      const op1End = op1.position + (op1.length ?? 0)
      const op2Start = op2.position
      const op2End = op2.position + (op2.length ?? 0)

      if (op1End <= op2Start) {
        return [op1, { ...op2, position: op2Start - (op1.length ?? 0) }]
      }
      if (op2End <= op1Start) {
        return [{ ...op1, position: op1Start - (op2.length ?? 0) }, op2]
      }

      const overlapStart = Math.max(op1Start, op2Start)
      const overlapEnd = Math.min(op1End, op2End)
      const overlapLength = Math.max(0, overlapEnd - overlapStart)

      const newOp1Length = (op1.length ?? 0) - overlapLength
      const newOp2Length = (op2.length ?? 0) - overlapLength

      const newOp1Pos = op1Start < op2Start ? op1Start : op2Start
      const newOp2Pos = op2Start < op1Start ? op2Start : op1Start

      return [
        { ...op1, position: newOp1Pos, length: newOp1Length },
        { ...op2, position: newOp2Pos, length: newOp2Length },
      ]
    }

    return [op1, op2]
  }

  static applyOperation(content: string, op: OTOperation): string {
    switch (op.type) {
      case 'insert':
        return content.slice(0, op.position) + (op.text ?? '') + content.slice(op.position)
      case 'delete':
        return content.slice(0, op.position) + content.slice(op.position + (op.length ?? 0))
      case 'retain':
        return content
      default:
        return content
    }
  }

  static createInsertOp(position: number, text: string, version: number): OTOperation {
    return { type: 'insert', position, text, version }
  }

  static createDeleteOp(position: number, length: number, version: number): OTOperation {
    return { type: 'delete', position, length, version }
  }

  static createRetainOp(position: number, version: number): OTOperation {
    return { type: 'retain', position, version }
  }
}
