export type AddLeadingZero<
  T extends string | number,
  S extends `${T}` = `${T}`,
> = S extends '0'
  ? '00'
  : S extends '1'
    ? '01'
    : S extends '2'
      ? '02'
      : S extends '3'
        ? '03'
        : S extends '4'
          ? '04'
          : S extends '5'
            ? '05'
            : S extends '6'
              ? '06'
              : S extends '7'
                ? '07'
                : S extends '8'
                  ? '08'
                  : S extends '9'
                    ? '09'
                    : S;
