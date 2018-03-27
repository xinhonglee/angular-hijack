import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'replaceString'})
export class ReplaceString implements PipeTransform {
  transform(value: string, delimiter: string, newDelimiter: string): string {
    let newValue = value.replace(delimiter, newDelimiter);
    return `${newValue}`;
  }
}
